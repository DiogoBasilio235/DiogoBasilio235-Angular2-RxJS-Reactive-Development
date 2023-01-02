import { Component, OnInit } from '@angular/core';
import {of, from, map, tap, take} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Angular2-RxJS-Reactive-Development';

  ngOnInit() {
    //Creation functions of Observables. To start receiving items, just subscribe it.

    // of & from emit a finite set of items. When it completes, the unsubscribe is automatic.
    // To avoid memory leaks, we should always unsubscribe the Observable

    //If an Observable throws an error, it won't emit any further items. 
    //of(2, 4, 6, 8).subscribe(item => console.log(item));



      //inside pipe()
  //Each operator takes an Observable as input and creates and returns an output observable.
  //The last output Observable is the final result that emits to the defined Observer.
    from([20, 15, 10, 5]).pipe(
        //The purpose of tap() is to perform an operation that does not affect the emitted items.
        //Use tap() for debugging and performing actions outside of the flow of data.
        tap(item => console.log(`Emmited item ..${ item}`)),

        //map() operator transforms each item as defines by the function we provide.
        //Use map() to make changes to each emmited item.
        map(item => item * 2),
        map(item => item - 10),
        //We need an explicit return in a multi-line arrow function
        map(item => {
          if (item === 0) {
            throw new Error('zero detected');
          } 
          return item;
        }),
        //The take() operator emits a specified number of items.
        //Use take() for taking a specified number of items and limiting unlimited observables. It is a filtering operator. 
        take(3)
    ).subscribe({
      next: (item) => console.log(`Resulting item ${item}`),
      error: (err) => console.error(`error ocurred ${err}`),
      complete: () => console.log("complete")
    })

    //from(["Hope ", "this ", "works."]).subscribe({
    //  next: (item) => console.log(item),
    //  error: (err) => console.error(`error ocurred ${err}`),
    //  complete: () => console.log("It did!")
    //})
  }
}
