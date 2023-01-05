import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, combineLatest, EMPTY, map, startWith, Subject} from 'rxjs';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  
  //This way we createe an action stream. It will emit a selectedCategoryId(number) everytime our user filters the items
  private categorySelectedSubject = new Subject<number>();
  //Then we expose the Observable using .asObservable() 
  categorySelectedAction$ = this.categorySelectedSubject.asObservable()

  //Now we will combine both arrays, using the productsWithCategory + the categorySelectedAction$
  products$ = combineLatest([
    this.productService.productsWithCategory$,
    this.categorySelectedAction$
    .pipe(
      startWith(0) //This way the filter starts always with all the values.
    )
    ])
  .pipe(
    map(([products, selectedCategoryId]) => //This map returns the products and the selectedCategoryId
    products.filter( product => //and here only the products that match the categoryId will be returned
      selectedCategoryId ? product.categoryId === selectedCategoryId : true) // true is selected to return all products
    ),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY
    }));

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(private productService: ProductService,
              private productCategoryService : ProductCategoryService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  // This onSelected
  onSelected(categoryId: string): void {
    //The .next() method is used to emit the selectedCategoryId to the stream
    //The plus sign casts the string gategoryId to a number, otherwise the triple '=' in the filter function wont match our value
    this.categorySelectedSubject.next(+categoryId);
  }
}
function startWidth(arg0: number): import("rxjs").OperatorFunction<number, unknown> {
  throw new Error('Function not implemented.');
}

