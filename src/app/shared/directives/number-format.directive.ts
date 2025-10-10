// number-format.directive.ts
import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]'
})
export class NumberFormatDirective {
  private isTyping = false;

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const input = this.el.nativeElement;
    let value = input.value.replace(/,/g, '');

    // Allow only numbers and one decimal
    if (!/^\d*\.?\d*$/.test(value)) {
      value = value.replace(/[^\d.]/g, '');
    }

    this.isTyping = true;
    this.control.control?.setValue(value, { emitEvent: false });
    this.isTyping = false;
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    let value = input.value.replace(/,/g, '');

    if (value === '' || isNaN(+value)) return;

    // Format with commas
    const [integer, decimal] = value.split('.');
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimal ? '.' + decimal : '');

    input.value = formatted;
  }

  @HostListener('focus')
  onFocus() {
    // Remove commas for clean editing
    const input = this.el.nativeElement;
    input.value = input.value.replace(/,/g, '');
  }
}
