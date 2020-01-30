/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {Directive, ElementRef, HostListener, NgZone, ViewChild} from '@angular/core';
import {
  CanColor,
  CanColorCtor,
  CanDisable,
  CanDisableCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  RippleAnimationConfig
} from '@angular/material/core';
import {numbers} from '@material/ripple';

/** Inputs common to all buttons. */
export const MAT_BUTTON_INPUTS = ['disabled', 'disableRipple', 'color'];

/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
};

/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR: {selector: string, mdcClasses: string[]}[] = [
  {
    selector: 'mat-button',
    mdcClasses: ['mdc-button', 'mat-mdc-button'],
  },
  {
    selector: 'mat-flat-button',
    mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
  },
  {
    selector: 'mat-raised-button',
    mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
  },
  {
    selector: 'mat-stroked-button',
    mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
  },
  {
    selector: 'mat-fab',
    mdcClasses: ['mdc-fab', 'mat-mdc-fab'],
  },
  {
    selector: 'mat-mini-fab',
    mdcClasses: ['mdc-fab', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
  },
  {
    selector: 'mat-icon-button',
    mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
  }
];

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
export class MatButtonMixinCore {
  constructor(public _elementRef: ElementRef) {}
}

export const _MatButtonBaseMixin: CanDisableRippleCtor&CanDisableCtor&CanColorCtor&
    typeof MatButtonMixinCore = mixinColor(mixinDisabled(mixinDisableRipple(MatButtonMixinCore)));

/** Base class for all buttons.  */
@Directive()
export class MatButtonBase extends _MatButtonBaseMixin implements CanDisable, CanColor,
                                                                  CanDisableRipple {
  /** The ripple animation configuration to use for the buttons. */
  _rippleAnimation: RippleAnimationConfig = {
    enterDuration: numbers.DEACTIVATION_TIMEOUT_MS,
    exitDuration: numbers.FG_DEACTIVATION_MS
  };

  /** Whether the ripple is centered on the button. */
  _isRippleCentered = false;

  /** Reference to the MatRipple instance of the button. */
  @ViewChild(MatRipple) ripple: MatRipple;

  constructor(
      elementRef: ElementRef, public _platform: Platform, public _ngZone: NgZone,
      public _animationMode?: string) {
    super(elementRef);

    const classList = (elementRef.nativeElement as HTMLElement).classList;

    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding MDC classes.
    for (const pair of HOST_SELECTOR_MDC_CLASS_PAIR) {
      if (this._hasHostAttributes(pair.selector)) {
        pair.mdcClasses.forEach((className: string) => {
          classList.add(className);
        });
      }
    }
  }

  /** Focuses the button. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Gets whether the button has one of the given attributes. */
  private _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._elementRef.nativeElement.hasAttribute(attribute));
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}

/** Shared inputs by buttons using the `<a>` tag */
export const MAT_ANCHOR_INPUTS = ['disabled', 'disableRipple', 'color', 'tabIndex'];

/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',

  // Note that we ignore the user-specified tabindex when it's disabled for
  // consistency with the `mat-button` applied on native buttons where even
  // though they have an index, they're not tabbable.
  '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
  '[attr.aria-disabled]': 'disabled.toString()',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
};

/**
 * Anchor button base.
 */
@Directive()
export class MatAnchorBase extends MatButtonBase {
  tabIndex: number;

  constructor(elementRef: ElementRef, platform: Platform, ngZone: NgZone,
              animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritten.
  // TODO(mmalerba): we move this back into `host` once Ivy is turned on by default.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('click', ['$event'])
  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
