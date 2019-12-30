import {Directive, Inject, OnDestroy, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, of as observableOf, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

import {CdkSelection} from './selection';

/**
 * Makes the element a select-all toggle.
 *
 * Must be used within a parent `CdkSelection` directive. It toggles the selection states
 * of all the selection toggles connected with the `CdkSelection` directive.
 * If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the select-all state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state, `indeterminate$` to get the indeterminate state,
 * and `toggle()` to change the selection state.
 */
@Directive({
  selector: '[cdkSelectAll]',
  exportAs: 'cdkSelectAll',
})
export class CdkSelectAll<T> implements OnDestroy, OnInit {
  private readonly _destroyed$ = new Subject();

  readonly checked$ = new BehaviorSubject(false);
  readonly indeterminate$ = new BehaviorSubject(false);

  constructor(
      private readonly _selection: CdkSelection<T>,
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) private readonly _controlValueAccessor:
          ControlValueAccessor[]) {}

  ngOnInit() {
    this._selection.cdkSelectionChange
        .pipe(
            switchMap(() => observableOf(this._selection.isAllSelected())),
            takeUntil(this._destroyed$),
            )
        .subscribe((state) => {
          this.checked$.next(state);
        });

    this._selection.cdkSelectionChange
        .pipe(
            switchMap(() => observableOf(this._selection.isPartialSelected())),
            takeUntil(this._destroyed$),
            )
        .subscribe((state) => {
          this.indeterminate$.next(state);
        });

    if (this._controlValueAccessor && this._controlValueAccessor.length) {
      this._controlValueAccessor[0].registerOnChange((e: unknown) => {
        if (e === true || e === false) {
          this.toggle();
        }
      });

      this.checked$.pipe(takeUntil(this._destroyed$)).subscribe((state) => {
        this._controlValueAccessor[0].writeValue(state);
      });
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  toggle(event?: Event) {
    // This is needed when applying the directive on a native <input type="checkbox">
    // checkbox. The default behavior needs to be prevented in order to support the indeterminate state.
    // The timeout is also needed so the checkbox can show the latest state.
    if (event) {
      event.preventDefault();
    }

    setTimeout(() => {
      this._selection.toggleSelectAll();
    });
  }
}
