import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
})
export class UppercaseInputDirective {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const upper = (event.target as HTMLInputElement).value.toUpperCase();
    this.el.nativeElement.value = upper;
    this.ngControl?.control?.setValue(upper, { emitModelToViewChange: false });
  }
}
