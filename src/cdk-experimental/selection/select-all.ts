import {Directive, Inject, OnDestroy, Optional} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {CdkSelection} from './selection';

@Directive({
  selector: ['cdkSelectAll'],
  exportAs: 'cdkSelectAll',
})
export class CdkSelectAll<T> implements OnDestroy {
  private readonly _destroyed$ = new Subject();

  readonly checkedState$ = new BehaviorSubject(false);
  readonly indeterminateState$ = new BehaviorSubject(false);

  constructor(
      private readonly _selection: CdkSelection<T>,
      @Optional() @Inject(NG_VALUE_ACCESSOR) private _control: ControlValueAccessor[]) {
    _selection.cdkSelectionChange
        .pipe(
            switchMap(() => observableOf(_selection.isAllSelected())),
            takeUntil(this._destroyed$),
            )
        .subscribe((state) => {
          this.checkedState$.next(state);
        });

    _selection.cdkSelectionChange
        .pipe(
            switchMap(() => observableOf(_selection.isPartialSelected())),
            takeUntil(this._destroyed$),
            )
        .subscribe((state) => {
          this.indeterminateState$.next(state);
        });

    if (this._control && this._control.length) {
      this._control[0].registerOnChange((e) => {
        if (e === true || e === false) {
          this.toggle();
        }
      });

      this.checkedState$.pipe(takeUntil(this._destroyed$)).subscribe((state) => {
        this._control[0].writeValue(state);
      });
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  toggle() {
    this._selection.toggleSelectAll();
  }
}
