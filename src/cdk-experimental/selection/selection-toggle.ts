import {Directive, Inject, Input, OnDestroy, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

import {CdkSelection} from './selection';

/**
 * Makes the element a selection toggle.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. If `trackBy` is used on `CdkSelection`, the index of the value
 * is required. If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the selection state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state of the value, and `toggle()` to change the selection
 * state.
 */
@Directive({
  selector: '[cdkSelectionToggle]',
  exportAs: 'cdkSelectionToggle',
})
export class CdkSelectionToggle<T> implements OnDestroy, OnInit {
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

  readonly checked$ = new BehaviorSubject<boolean>(false);

  constructor(
      private _selection: CdkSelection<T>,
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) private _controlValueAccessors:
          ControlValueAccessor[],
  ) {}

  ngOnInit() {
    if (this._controlValueAccessors && this._controlValueAccessors.length) {
      this._controlValueAccessors[0].registerOnChange((e: unknown) => {
        if (typeof e === 'boolean') {
          this.toggle();
        }
      });

      this.checked$.pipe(takeUntil(this._destroyed$)).subscribe((state) => {
        this._controlValueAccessors[0].writeValue(state);
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
