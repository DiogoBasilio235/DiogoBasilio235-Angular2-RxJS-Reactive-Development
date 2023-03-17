import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SupplierService } from '../suppliers/supplier.service';
import { BehaviorSubject, catchError, combineLatest, filter, forkJoin, map, merge, Observable, of, scan, shareReplay, Subject, switchMap, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';
  
  products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe( 
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([
    this.products$,                                 //Observables [] to combine
    this.productCategoryService.productCategories$  //Observables [] to combine
  ]).pipe(
    map(([products, categories]) =>  //combineLatest emits one item with both arrays(it is using destructuring to define a name for each of the array elements)
    products.map(product => ({       // Each product is mapped to contain it's properties plus de category name
      ...product,
      price: product.price ? product.price * 1.5 : 0,
      category: categories.find(c => product.categoryId === c.id)?.name, //If it exists a category
      searchKey: [product.productName]
    } as Product))
    ), shareReplay(1)
  );

  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) { }


  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

  //We use a BehaviourSubject and not Subject to ensure our action stream emits at least once.
  //This action sream will emit the ID of the user-selected product, so the BehaviorSubject is defined as a number.
  private productSelectedSubject = new BehaviorSubject<number>(0);//0 is defined to specify a no selected product
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  //The 3 steps of reacting to an action
  //Step 1 : Create an action stream with the Object we want to emit (Product) as private
  private productInsertedSubject = new Subject<Product>();
  //Step 2: we expose our action stream as an observable
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  //Step 3: We use the merge() creation function to merge our data stream and our action stream
  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
    ).pipe(                 // The scan() takes the accumulator and the current value.
      scan((acc, value) =>         //In an arrow function with multiple parameters, we enclose them in parentheses
        (value instanceof Array) ? //We then define the accumulator function and check the tipe of the emitted value 
        [...value] : [...acc, value], //If it isn't an array of [...value], it's a new product and we push the new product
        [] as Product[])              // Lastly we add a seed values specifying an empty Product array 
    )
  

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) => // array destructuring
    products.find(product => product.id === selectedProductId) // We map the products to find the product with product.id === to selectedProductId
  ), tap(product => console.log('selectedProduct', product)),
    shareReplay(1)
  );

  // Two different approaches to get the product Suppliers
  // Retrieves ALL data from a data source and caches it
  //selectedProductSuppliers$ = combineLatest([
  //  this.selectedProduct$,
  //  this.supplierService.suppliers$
  //]).pipe(
  //  map(([selectedProduct, suppliers]) =>
   // suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id))
  //  )
  //)

  // Retrieves the data from a data source as we need it
  selectedProductSuppliers$ = this.selectedProduct$
  .pipe(
    filter(product => Boolean(product)),
    switchMap(selectedProduct => {
      if (selectedProduct?.supplierIds) {
        return forkJoin(selectedProduct.supplierIds.map(supplierId => 
          this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
      } else {
        return of([]);
      }
    }), 
    tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers)))
  );

  //Everytime this method is called, the selectedProductId is emitted into the productSelectedAction stream,
  // combineLatest emits, making the pipeline to be re-executed.
  selectedProductChanged(selectedProductId: number) : void{
    //The Subject .next() method is called to emit that ID to the action stream.
    this.productSelectedSubject.next(selectedProductId)
  }

  //The newProduct is passed in or use a new fakeProducts
  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }


}
