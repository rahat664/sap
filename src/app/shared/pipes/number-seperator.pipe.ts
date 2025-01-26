import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'number',
  standalone: true,
})
export class numberPipe implements PipeTransform {
  constructor(private decimalPipe: DecimalPipe) {}
  transform(value: number | string): unknown {
    // return value
    //   .toString()
    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return this.decimalPipe.transform(value);
  }
}
