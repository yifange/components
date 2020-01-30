/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {
  A,
  DOWN_ARROW,
  END,
  ENTER,
  hasModifierKey,
  HOME,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  isDevMode,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanDisableRipple,
  CanDisableRippleCtor,
  MatLine,
  mixinDisableRipple,
  setLines,
  ThemePalette,
} from '@angular/material/core';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {MatListAvatarCssMatStyler, MatListIconCssMatStyler} from './list';


/** @docs-private */
class MatSelectionListBase {}
const _MatSelectionListMixinBase: CanDisableRippleCtor & typeof MatSelectionListBase =
    mixinDisableRipple(MatSelectionListBase);

/** @docs-private */
class MatListOptionBase {}
const _MatListOptionMixinBase: CanDisableRippleCtor & typeof MatListOptionBase =
    mixinDisableRipple(MatListOptionBase);

/** @docs-private */
export const MAT_SELECTION_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSelectionList),
  multi: true
};

/** Change event that is being fired whenever the selected state of an option changes. */
export class MatSelectionListChange {
  constructor(
    /** Reference to the selection list that emitted the event. */
    public source: MatSelectionList,
    /** Reference to the option that has been changed. */
    public option: MatListOption) {}
}

/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is selected.
 */
@Component({
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  inputs: ['disableRipple'],
  host: {
    'role': 'option',
    'class': 'mat-list-item mat-list-option',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
    '(click)': '_handleClick()',
    'tabindex': '-1',
    '[class.mat-list-item-disabled]': 'disabled',
    '[class.mat-list-item-with-avatar]': '_avatar || _icon',
    // Manually set the "primary" or "warn" class if the color has been explicitly
    // set to "primary" or "warn". The pseudo checkbox picks up these classes for
    // its theme.
    '[class.mat-primary]': 'color === "primary"',
    // Even though accent is the default, we need to set this class anyway, because the  list might
    // be placed inside a parent that has one of the other colors with a higher specificity.
    '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
    '[class.mat-warn]': 'color === "warn"',
    '[class.mat-list-single-selected-option]': 'selected && !selectionList.multiple',
    '[attr.aria-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListOption extends _MatListOptionMixinBase implements AfterContentInit, OnDestroy,
                                                                      OnInit, FocusableOption,
                                                                      CanDisableRipple {
  private _selected = false;
  private _disabled = false;
  private _hasFocus = false;

  @ContentChild(MatListAvatarCssMatStyler) _avatar: MatListAvatarCssMatStyler;
  @ContentChild(MatListIconCssMatStyler) _icon: MatListIconCssMatStyler;
  @ContentChildren(MatLine, {descendants: true}) _lines: QueryList<MatLine>;

  /** DOM element containing the item's text. */
  @ViewChild('text') _text: ElementRef;

  /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
  @Input() checkboxPosition: 'before' | 'after' = 'after';

  /** Theme color of the list option. This sets the color of the checkbox. */
  @Input()
  get color(): ThemePalette { return this._color || this.selectionList.color; }
  set color(newValue: ThemePalette) { this._color = newValue; }
  private _color: ThemePalette;

  /**
   * This is set to true after the first OnChanges cycle so we don't clear the value of `selected`
   * in the first cycle.
   */
  private _inputsInitialized = false;
  /** Value of the option */
  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    if (this.selected && newValue !== this.value && this._inputsInitialized) {
      this.selected = false;
    }

    this._value = newValue;
  }
  private _value: any;

  /** Whether the option is disabled. */
  @Input()
  get disabled() { return this._disabled || (this.selectionList && this.selectionList.disabled); }
  set disabled(value: any) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._changeDetector.markForCheck();
    }
  }

  /** Whether the option is selected. */
  @Input()
  get selected(): boolean { return this.selectionList.selectedOptions.isSelected(this); }
  set selected(value: boolean) {
    const isSelected = coerceBooleanProperty(value);

    if (isSelected !== this._selected) {
      this._setSelected(isSelected);
      this.selectionList._reportValueChange();
    }
  }

  constructor(private _element: ElementRef<HTMLElement>,
              private _changeDetector: ChangeDetectorRef,
              /** @docs-private */
              @Inject(forwardRef(() => MatSelectionList)) public selectionList: MatSelectionList) {
    super();
  }

  ngOnInit() {
    const list = this.selectionList;

    if (list._value && list._value.some(value => list.compareWith(value, this._value))) {
      this._setSelected(true);
    }

    const wasSelected = this._selected;

    // List options that are selected at initialization can't be reported properly to the form
    // control. This is because it takes some time until the selection-list knows about all
    // available options. Also it can happen that the ControlValueAccessor has an initial value
    // that should be used instead. Deferring the value change report to the next tick ensures
    // that the form control value is not being overwritten.
    Promise.resolve().then(() => {
      if (this._selected || wasSelected) {
        this.selected = true;
        this._changeDetector.markForCheck();
      }
    });
    this._inputsInitialized = true;
  }

  ngAfterContentInit() {
    setLines(this._lines, this._element);
  }

  ngOnDestroy(): void {
    if (this.selected) {
      // We have to delay this until the next tick in order
      // to avoid changed after checked errors.
      Promise.resolve().then(() => {
        this.selected = false;
      });
    }

    const hadFocus = this._hasFocus;
    const newActiveItem = this.selectionList._removeOptionFromList(this);

    // Only move focus if this option was focused at the time it was destroyed.
    if (hadFocus && newActiveItem) {
      newActiveItem.focus();
    }
  }

  /** Toggles the selection state of the option. */
  toggle(): void {
    this.selected = !this.selected;
  }

  /** Allows for programmatic focusing of the option. */
  focus(): void {
    this._element.nativeElement.focus();
  }

  /**
   * Returns the list item's text label. Implemented as a part of the FocusKeyManager.
   * @docs-private
   */
  getLabel() {
    return this._text ? (this._text.nativeElement.textContent || '') : '';
  }

  /** Whether this list item should show a ripple effect when clicked. */
  _isRippleDisabled() {
    return this.disabled || this.disableRipple || this.selectionList.disableRipple;
  }

  _handleClick() {
    if (!this.disabled && (this.selectionList.multiple || !this.selected)) {
      this.toggle();

      // Emit a change event if the selected state of the option changed through user interaction.
      this.selectionList._emitChangeEvent(this);
    }
  }

  _handleFocus() {
    this.selectionList._setFocusedOption(this);
    this._hasFocus = true;
  }

  _handleBlur() {
    this.selectionList._onTouched();
    this._hasFocus = false;
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }

  /** Sets the selected state of the option. Returns whether the value has changed. */
  _setSelected(selected: boolean): boolean {
    if (selected === this._selected) {
      return false;
    }

    this._selected = selected;

    if (selected) {
      this.selectionList.selectedOptions.select(this);
    } else {
      this.selectionList.selectedOptions.deselect(this);
    }

    this._changeDetector.markForCheck();
    return true;
  }

  /**
   * Notifies Angular that the option needs to be checked in the next change detection run. Mainly
   * used to trigger an update of the list option if the disabled state of the selection list
   * changed.
   */
  _markForCheck() {
    this._changeDetector.markForCheck();
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_selected: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}


/**
 * Material Design list component where each item is a selectable option. Behaves as a listbox.
 */
@Component({
  selector: 'mat-selection-list',
  exportAs: 'matSelectionList',
  inputs: ['disableRipple'],
  host: {
    'role': 'listbox',
    '[tabIndex]': 'tabIndex',
    'class': 'mat-selection-list mat-list-base',
    '(blur)': '_onTouched()',
    '(keydown)': '_keydown($event)',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-disabled]': 'disabled.toString()',
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MAT_SELECTION_LIST_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatSelectionList extends _MatSelectionListMixinBase implements CanDisableRipple,
  AfterContentInit, ControlValueAccessor, OnDestroy, OnChanges {
  private _multiple = true;
  private _contentInitialized = false;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager<MatListOption>;

  /** The option components contained within this selection-list. */
  @ContentChildren(MatListOption, {descendants: true}) options: QueryList<MatListOption>;

  /** Emits a change event whenever the selected state of an option changes. */
  @Output() readonly selectionChange: EventEmitter<MatSelectionListChange> =
      new EventEmitter<MatSelectionListChange>();

  /** Tabindex of the selection list. */
  @Input() tabIndex: number = 0;

  /** Theme color of the selection list. This sets the checkbox color for all list options. */
  @Input() color: ThemePalette = 'accent';

  /**
   * Function used for comparing an option against the selected value when determining which
   * options should appear as selected. The first argument is the value of an options. The second
   * one is a value from the selected value. A boolean must be returned.
   */
  @Input() compareWith: (o1: any, o2: any) => boolean = (a1, a2) => a1 === a2;

  /** Whether the selection list is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    // The `MatSelectionList` and `MatListOption` are using the `OnPush` change detection
    // strategy. Therefore the options will not check for any changes if the `MatSelectionList`
    // changed its state. Since we know that a change to `disabled` property of the list affects
    // the state of the options, we manually mark each option for check.
    this._markOptionsForCheck();
  }
  private _disabled: boolean = false;

  /** Whether selection is limited to one or multiple items (default multiple). */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._multiple) {
      if (isDevMode() && this._contentInitialized) {
        throw new Error(
            'Cannot change `multiple` mode of mat-selection-list after initialization.');
      }

      this._multiple = newValue;
      this.selectedOptions = new SelectionModel(this._multiple, this.selectedOptions.selected);
    }
  }

  /** The currently selected options. */
  selectedOptions = new SelectionModel<MatListOption>(this._multiple);

  /** View to model callback that should be called whenever the selected options change. */
  private _onChange: (value: any) => void = (_: any) => {};

  /** Keeps track of the currently-selected value. */
  _value: string[]|null;

  /** Emits when the list has been destroyed. */
  private _destroyed = new Subject<void>();

  /** View to model callback that should be called if the list or its options lost focus. */
  _onTouched: () => void = () => {};

  /** Whether the list has been destroyed. */
  private _isDestroyed: boolean;

  constructor(private _element: ElementRef<HTMLElement>, @Attribute('tabindex') tabIndex: string) {
    super();
    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterContentInit(): void {
    this._contentInitialized = true;

    this._keyManager = new FocusKeyManager<MatListOption>(this.options)
      .withWrap()
      .withTypeAhead()
      // Allow disabled items to be focusable. For accessibility reasons, there must be a way for
      // screenreader users, that allows reading the different options of the list.
      .skipPredicate(() => false)
      .withAllowedModifierKeys(['shiftKey']);

    if (this._value) {
      this._setOptionsFromValues(this._value);
    }

    // Sync external changes to the model back to the options.
    this.selectedOptions.changed.pipe(takeUntil(this._destroyed)).subscribe(event => {
      if (event.added) {
        for (let item of event.added) {
          item.selected = true;
        }
      }

      if (event.removed) {
        for (let item of event.removed) {
          item.selected = false;
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const disableRippleChanges = changes['disableRipple'];
    const colorChanges = changes['color'];

    if ((disableRippleChanges && !disableRippleChanges.firstChange) ||
        (colorChanges && !colorChanges.firstChange)) {
      this._markOptionsForCheck();
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this._isDestroyed = true;
  }

  /** Focuses the selection list. */
  focus(options?: FocusOptions) {
    this._element.nativeElement.focus(options);
  }

  /** Selects all of the options. */
  selectAll() {
    this._setAllOptionsSelected(true);
  }

  /** Deselects all of the options. */
  deselectAll() {
    this._setAllOptionsSelected(false);
  }

  /** Sets the focused option of the selection-list. */
  _setFocusedOption(option: MatListOption) {
    this._keyManager.updateActiveItem(option);
  }

  /**
   * Removes an option from the selection list and updates the active item.
   * @returns Currently-active item.
   */
  _removeOptionFromList(option: MatListOption): MatListOption | null {
    const optionIndex = this._getOptionIndex(option);

    if (optionIndex > -1 && this._keyManager.activeItemIndex === optionIndex) {
      // Check whether the option is the last item
      if (optionIndex > 0) {
        this._keyManager.updateActiveItem(optionIndex - 1);
      } else if (optionIndex === 0 && this.options.length > 1) {
        this._keyManager.updateActiveItem(Math.min(optionIndex + 1, this.options.length - 1));
      }
    }

    return this._keyManager.activeItem;
  }

  /** Passes relevant key presses to our key manager. */
  _keydown(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    const manager = this._keyManager;
    const previousFocusIndex = manager.activeItemIndex;
    const hasModifier = hasModifierKey(event);

    switch (keyCode) {
      case SPACE:
      case ENTER:
        if (!hasModifier && !manager.isTyping()) {
          this._toggleFocusedOption();
          // Always prevent space from scrolling the page since the list has focus
          event.preventDefault();
        }
        break;
      case HOME:
      case END:
        if (!hasModifier) {
          keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
          event.preventDefault();
        }
        break;
      case A:
        if (hasModifierKey(event, 'ctrlKey') && !manager.isTyping()) {
          this.options.find(option => !option.selected) ? this.selectAll() : this.deselectAll();
          event.preventDefault();
        }
        break;
      default:
        manager.onKeydown(event);
    }

    if ((keyCode === UP_ARROW || keyCode === DOWN_ARROW) && event.shiftKey &&
        manager.activeItemIndex !== previousFocusIndex) {
      this._toggleFocusedOption();
    }
  }

  /** Reports a value change to the ControlValueAccessor */
  _reportValueChange() {
    // Stop reporting value changes after the list has been destroyed. This avoids
    // cases where the list might wrongly reset its value once it is removed, but
    // the form control is still live.
    if (this.options && !this._isDestroyed) {
      const value = this._getSelectedOptionValues();
      this._onChange(value);
      this._value = value;
    }
  }

  /** Emits a change event if the selected state of an option changed. */
  _emitChangeEvent(option: MatListOption) {
    this.selectionChange.emit(new MatSelectionListChange(this, option));
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(values: string[]): void {
    this._value = values;

    if (this.options) {
      this._setOptionsFromValues(values || []);
    }
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /** Sets the selected options based on the specified values. */
  private _setOptionsFromValues(values: string[]) {
    this.options.forEach(option => option._setSelected(false));

    values.forEach(value => {
      const correspondingOption = this.options.find(option => {
        // Skip options that are already in the model. This allows us to handle cases
        // where the same primitive value is selected multiple times.
        return option.selected ? false : this.compareWith(option.value, value);
      });

      if (correspondingOption) {
        correspondingOption._setSelected(true);
      }
    });
  }

  /** Returns the values of the selected options. */
  private _getSelectedOptionValues(): string[] {
    return this.options.filter(option => option.selected).map(option => option.value);
  }

  /** Toggles the state of the currently focused option if enabled. */
  private _toggleFocusedOption(): void {
    let focusedIndex = this._keyManager.activeItemIndex;

    if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
      let focusedOption: MatListOption = this.options.toArray()[focusedIndex];

      if (focusedOption && !focusedOption.disabled && (this._multiple || !focusedOption.selected)) {
        focusedOption.toggle();

        // Emit a change event because the focused option changed its state through user
        // interaction.
        this._emitChangeEvent(focusedOption);
      }
    }
  }

  /**
   * Sets the selected state on all of the options
   * and emits an event if anything changed.
   */
  private _setAllOptionsSelected(isSelected: boolean) {
    // Keep track of whether anything changed, because we only want to
    // emit the changed event when something actually changed.
    let hasChanged = false;

    this.options.forEach(option => {
      if (option._setSelected(isSelected)) {
        hasChanged = true;
      }
    });

    if (hasChanged) {
      this._reportValueChange();
    }
  }

  /**
   * Utility to ensure all indexes are valid.
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of options.
   */
  private _isValidIndex(index: number): boolean {
    return index >= 0 && index < this.options.length;
  }

  /** Returns the index of the specified list option. */
  private _getOptionIndex(option: MatListOption): number {
    return this.options.toArray().indexOf(option);
  }

  /** Marks all the options to be checked in the next change detection run. */
  private _markOptionsForCheck() {
    if (this.options) {
      this.options.forEach(option => option._markForCheck());
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_multiple: BooleanInput;
}
