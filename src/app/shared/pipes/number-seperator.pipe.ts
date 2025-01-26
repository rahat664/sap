import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'number',
  standalone: true,
})
export class numberPipe implements PipeTransform {
  transform(value: number | string): unknown {
    if (value === null || value === undefined) {
      return '';
    }

    // Convert the value to a string and handle decimal values
    const numString = value.toString();
    const [integerPart, decimalPart] = numString.split('.');

    // Format the integer part for the Indian numbering system
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);

    const formattedInteger =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
      (otherNumbers ? ',' : '') +
      lastThree;

    // Append the decimal part if it exists
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  }
}
