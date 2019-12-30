import {Directive, Inject, Input, OnDestroy, Optional} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {CdkSelection} from './selection';

@Directive({
  selector: '[cdkSlectionToggle]', exportAs: 'cdkSelectionToggle',
}
export class CdkSelectionToggle<T> implements OnDestroy {
  @Input()
  get cdkSelectionToggleValue(): T {
    return this._value;
  }
  set cdkSelectionToggleValue(value: T) {
    this._value = value;
  }
  private _value: T;

  @Input()
  get cdkSelectionToggleIndex(): number|undefined {
    return this._index;
  }
  set cdkSelectionToggleIndex(index: number|undefined) {
    this._index = index;
  }
  private _index?: number;

  private _destroyed$ = new Subject();

  checked$ = new BehaviorSubject(false);

  constructor(
      private readonly _selection: CdkSelection<T>,
      @Optional() @Inject(NG_VALUE_ACCESSOR) private _control: ControlValueAccessor[],
  ) {
    if (this._control && this._control.length) {
      this._control[0].registerOnChange((e) => {
        if (typeof e === 'boolean') {
          this.toggle();
        }
      });

      this.checked$.pipe(takeUntil(this._destroyed$)).subscribe((state) => {
        this._control[0].writeValue(state);
      });
    }

    this.checked$.next(this._isSelected());
    this._selection.cdkSelectionChange
        .pipe(
            switchMap(() => observableOf(this._isSelected())),
            distinctUntilChanged(),
            takeUntil(this._destroyed$),
            )
        .subscribe((state: boolean) => {
          this.checked$.next(state);
        });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  toggle() {
    this._selection.toggleSelection(this._value, this._index);
  }

  private _isSelected(): boolean {
    return this._selection.isSelected(this._value, this._index);
  }
}
