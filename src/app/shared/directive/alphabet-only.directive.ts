import { Directive, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appAlphabetOnly]',
})
export class AlphabetOnlyDirective {
  constructor() {}

  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      !(charCode >= 65 && charCode <= 90) && // Uppercase letters
      !(charCode >= 97 && charCode <= 122) && // Lowercase letters
      charCode !== 32 && // Space
      charCode !== 8 // Backspace
    ) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event']) onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z ]/g, '');
  }
}
