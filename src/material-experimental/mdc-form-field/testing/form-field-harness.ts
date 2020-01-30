/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  HarnessQuery,
  TestElement
} from '@angular/cdk/testing';
import {FormFieldHarnessFilters} from '@angular/material/form-field/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatSelectHarness} from '@angular/material/select/testing';

// TODO(devversion): support datepicker harness once developed (COMP-203).
// Also support chip list harness.
/** Possible harnesses of controls which can be bound to a form-field. */
export type FormFieldControlHarness = MatInputHarness|MatSelectHarness;

/** Harness for interacting with a MDC-based form-field's in tests. */
export class MatFormFieldHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-form-field';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatFormFieldHarness` that meets
   * certain criteria.
   * @param options Options for filtering which form field instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: FormFieldHarnessFilters = {}): HarnessPredicate<MatFormFieldHarness> {
    return new HarnessPredicate(MatFormFieldHarness, options)
        .addOption(
            'floatingLabelText', options.floatingLabelText,
            async (harness, text) => HarnessPredicate.stringMatches(await harness.getLabel(), text))
        .addOption(
            'hasErrors', options.hasErrors,
            async (harness, hasErrors) => await harness.hasErrors() === hasErrors);
  }

  private _mdcTextField = this.locatorFor('.mat-mdc-text-field-wrapper');

  private _prefixContainer = this.locatorForOptional('.mat-mdc-form-field-prefix');
  private _suffixContainer = this.locatorForOptional('.mat-mdc-form-field-suffix');
  private _label = this.locatorForOptional('.mdc-floating-label');
  private _errors = this.locatorForAll('.mat-mdc-form-field-error');
  private _hints = this.locatorForAll('.mat-mdc-form-field-hint');

  private _inputControl = this.locatorForOptional(MatInputHarness);
  private _selectControl = this.locatorForOptional(MatSelectHarness);

  /** Gets the appearance of the form-field. */
  async getAppearance(): Promise<'fill'|'outline'> {
    const textFieldEl = await this._mdcTextField();
    if (await textFieldEl.hasClass('mdc-text-field--outlined')) {
      return 'outline';
    }
    return 'fill';
  }

  /**
   * Gets the harness of the control that is bound to the form-field. Only
   * default controls such as "MatInputHarness" and "MatSelectHarness" are
   * supported.
   */
  async getControl(): Promise<FormFieldControlHarness|null>;

  /**
   * Gets the harness of the control that is bound to the form-field. Searches
   * for a control that matches the specified harness type.
   */
  async getControl<X extends MatFormFieldControlHarness>(type: ComponentHarnessConstructor<X>):
      Promise<X|null>;

  /**
   * Gets the harness of the control that is bound to the form-field. Searches
   * for a control that matches the specified harness predicate.
   */
  async getControl<X extends MatFormFieldControlHarness>(type: HarnessPredicate<X>):
      Promise<X|null>;

  // Implementation of the "getControl" method overload signatures.
  async getControl<X extends MatFormFieldControlHarness>(type?: HarnessQuery<X>) {
    if (type) {
      return this.locatorForOptional(type)();
    }
    const hostEl = await this.host();
    const [isInput, isSelect] = await Promise.all([
      hostEl.hasClass('mat-mdc-form-field-type-mat-input'),
      hostEl.hasClass('mat-mdc-form-field-type-mat-select'),
    ]);
    if (isInput) {
      return this._inputControl();
    } else if (isSelect) {
      return this._selectControl();
    }
    return null;
  }

  /** Whether the form-field has a label. */
  async hasLabel(): Promise<boolean> {
    return (await this._label()) !== null;
  }

  /** Gets the label of the form-field. */
  async getLabel(): Promise<string|null> {
    const labelEl = await this._label();
    return labelEl ? labelEl.text() : null;
  }

  /** Whether the form-field has errors. */
  async hasErrors(): Promise<boolean> {
    return (await this.getTextErrors()).length > 0;
  }

  /** Whether the label is currently floating. */
  async isLabelFloating(): Promise<boolean> {
    const labelEl = await this._label();
    return labelEl !== null ? await labelEl.hasClass('mdc-floating-label--float-above') : false;
  }

  /** Whether the form-field is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-form-field-disabled');
  }

  /** Whether the form-field is currently autofilled. */
  async isAutofilled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-form-field-autofilled');
  }

  /** Gets the theme color of the form-field. */
  async getThemeColor(): Promise<'primary'|'accent'|'warn'> {
    const hostEl = await this.host();
    const [isAccent, isWarn] =
        await Promise.all([hostEl.hasClass('mat-accent'), hostEl.hasClass('mat-warn')]);
    if (isAccent) {
      return 'accent';
    } else if (isWarn) {
      return 'warn';
    }
    return 'primary';
  }

  /** Gets error messages which are currently displayed in the form-field. */
  async getTextErrors(): Promise<string[]> {
    return Promise.all((await this._errors()).map(e => e.text()));
  }

  /** Gets hint messages which are currently displayed in the form-field. */
  async getTextHints(): Promise<string[]> {
    return Promise.all((await this._hints()).map(e => e.text()));
  }

  /**
   * Gets a reference to the container element which contains all projected
   * prefixes of the form-field.
   */
  async getHarnessLoaderForPrefix(): Promise<TestElement|null> {
    return this._prefixContainer();
  }

  /**
   * Gets a reference to the container element which contains all projected
   * suffixes of the form-field.
   */
  async getHarnessLoaderForSuffix(): Promise<TestElement|null> {
    return this._suffixContainer();
  }

  /**
   * Whether the form control has been touched. Returns "null"
   * if no form control is set up.
   */
  async isControlTouched(): Promise<boolean|null> {
    if (!await this._hasFormControl()) {
      return null;
    }
    return (await this.host()).hasClass('ng-touched');
  }

  /**
   * Whether the form control is dirty. Returns "null"
   * if no form control is set up.
   */
  async isControlDirty(): Promise<boolean|null> {
    if (!await this._hasFormControl()) {
      return null;
    }
    return (await this.host()).hasClass('ng-dirty');
  }

  /**
   * Whether the form control is valid. Returns "null"
   * if no form control is set up.
   */
  async isControlValid(): Promise<boolean|null> {
    if (!await this._hasFormControl()) {
      return null;
    }
    return (await this.host()).hasClass('ng-valid');
  }

  /**
   * Whether the form control is pending validation. Returns "null"
   * if no form control is set up.
   */
  async isControlPending(): Promise<boolean|null> {
    if (!await this._hasFormControl()) {
      return null;
    }
    return (await this.host()).hasClass('ng-pending');
  }

  /** Checks whether the form-field control has set up a form control. */
  private async _hasFormControl(): Promise<boolean> {
    const hostEl = await this.host();
    // If no form "NgControl" is bound to the form-field control, the form-field
    // is not able to forward any control status classes. Therefore if either the
    // "ng-touched" or "ng-untouched" class is set, we know that it has a form control
    const [isTouched, isUntouched] =
        await Promise.all([hostEl.hasClass('ng-touched'), hostEl.hasClass('ng-untouched')]);
    return isTouched || isUntouched;
  }
}
