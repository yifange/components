/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Optional,
  QueryList,
  ViewEncapsulation,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import {
  CanDisable,
  CanDisableCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  MatLine,
  setLines,
  mixinDisableRipple,
  mixinDisabled,
} from '@angular/material/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// Boilerplate for applying mixins to MatList.
/** @docs-private */
class MatListBase {}
const _MatListMixinBase: CanDisableRippleCtor & CanDisableCtor & typeof MatListBase =
    mixinDisabled(mixinDisableRipple(MatListBase));

// Boilerplate for applying mixins to MatListItem.
/** @docs-private */
class MatListItemBase {}
const _MatListItemMixinBase: CanDisableRippleCtor & typeof MatListItemBase =
    mixinDisableRipple(MatListItemBase);

@Component({
  selector: 'mat-nav-list',
  exportAs: 'matNavList',
  host: {
    'role': 'navigation',
    'class': 'mat-nav-list mat-list-base'
  },
  templateUrl: 'list.html',
  styleUrls: ['list.css'],
  inputs: ['disableRipple', 'disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatNavList extends _MatListMixinBase implements CanDisable, CanDisableRipple,
  OnChanges, OnDestroy {
  /** Emits when the state of the list changes. */
  _stateChanges = new Subject<void>();

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}

@Component({
  selector: 'mat-list, mat-action-list',
  exportAs: 'matList',
  templateUrl: 'list.html',
  host: {
    'class': 'mat-list mat-list-base'
  },
  styleUrls: ['list.css'],
  inputs: ['disableRipple', 'disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatList extends _MatListMixinBase implements CanDisable, CanDisableRipple, OnChanges,
  OnDestroy {
  /** Emits when the state of the list changes. */
  _stateChanges = new Subject<void>();

  constructor(private _elementRef: ElementRef<HTMLElement>) {
    super();

    if (this._getListType() === 'action-list') {
      _elementRef.nativeElement.classList.add('mat-action-list');
    }
  }

  _getListType(): 'list' | 'action-list' | null {
    const nodeName = this._elementRef.nativeElement.nodeName.toLowerCase();

    if (nodeName === 'mat-list') {
      return 'list';
    }

    if (nodeName === 'mat-action-list') {
      return 'action-list';
    }

    return null;
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-list-avatar'}
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-list-icon'}
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  host: {'class': 'mat-subheader'}
})
export class MatListSubheaderCssMatStyler {}

/** An item within a Material Design list. */
@Component({
  selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-list-item',
    '[class.mat-list-item-disabled]': 'disabled',
    // @breaking-change 8.0.0 Remove `mat-list-item-avatar` in favor of `mat-list-item-with-avatar`.
    '[class.mat-list-item-avatar]': '_avatar || _icon',
    '[class.mat-list-item-with-avatar]': '_avatar || _icon',
  },
  inputs: ['disableRipple'],
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListItem extends _MatListItemMixinBase implements AfterContentInit,
    CanDisableRipple, OnDestroy {
  private _isInteractiveList: boolean = false;
  private _list?: MatNavList | MatList;
  private _destroyed = new Subject<void>();

  @ContentChildren(MatLine, {descendants: true}) _lines: QueryList<MatLine>;
  @ContentChild(MatListAvatarCssMatStyler) _avatar: MatListAvatarCssMatStyler;
  @ContentChild(MatListIconCssMatStyler) _icon: MatListIconCssMatStyler;

  constructor(private _element: ElementRef<HTMLElement>,
              _changeDetectorRef: ChangeDetectorRef,
              @Optional() navList?: MatNavList,
              @Optional() list?: MatList) {
    super();
    this._isInteractiveList = !!(navList || (list && list._getListType() === 'action-list'));
    this._list = navList || list;

    // If no type attributed is specified for <button>, set it to "button".
    // If a type attribute is already specified, do nothing.
    const element = this._getHostElement();

    if (element.nodeName.toLowerCase() === 'button' && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button');
    }

    if (this._list) {
      // React to changes in the state of the parent list since
      // some of the item's properties depend on it (e.g. `disableRipple`).
      this._list._stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
        _changeDetectorRef.markForCheck();
      });
    }
  }

  /** Whether the option is disabled. */
  @Input()
  get disabled() { return this._disabled || !!(this._list && this._list.disabled); }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  ngAfterContentInit() {
    setLines(this._lines, this._element);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Whether this list item should show a ripple effect when clicked. */
  _isRippleDisabled() {
    return !this._isInteractiveList || this.disableRipple ||
           !!(this._list && this._list.disableRipple);
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }

  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
