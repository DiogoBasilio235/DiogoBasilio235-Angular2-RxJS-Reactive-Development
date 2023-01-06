import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, EMPTY, Subject } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable(); // We create a Subject and expose the Observable

  products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err); //And set a value to the subject stream by calling the next() method, passing the value to emit
      return EMPTY;
    })
  );

  //Our template also needs a notification everytime our selected product changes, so it can highlight the appropriate entry
  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  //When the onSelected() method is clicked on the HTML page, we call the selectedProductChanged.
  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
