import {ComponentHarness, HarnessLoader, HarnessPredicate} from '@angular/cdk/testing';
import {
  createFakeEvent,
  dispatchFakeEvent,
} from '@angular/cdk/testing/private';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldHarness} from './form-field-harness';

/** Shared tests to run on both the original and MDC-based form-field's. */
export function runHarnessTests(
    modules: Type<any>[], {formFieldHarness, inputHarness, selectHarness, isMdcImplementation}: {
      formFieldHarness: typeof MatFormFieldHarness,
      inputHarness: Type<any>,
      selectHarness: Type<any>,
      isMdcImplementation: boolean
    }) {
  let fixture: ComponentFixture<FormFieldHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          imports: [NoopAnimationsModule, ReactiveFormsModule, ...modules],
          declarations: [FormFieldHarnessTest],
        })
        .compileComponents();

    fixture = TestBed.createComponent(FormFieldHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be able to load harnesses', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(formFields.length).toBe(5);
  });

  it('should be able to load form-field that matches specific selector', async () => {
    const formFieldMatches = await loader.getAllHarnesses(formFieldHarness.with({
      selector: '#first-form-field',
    }));
    expect(formFieldMatches.length).toBe(1);
  });

  it('should be able to get appearance of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].getAppearance()).toBe(isMdcImplementation ? 'fill' : 'legacy');
    expect(await formFields[1].getAppearance()).toBe(isMdcImplementation ? 'fill' : 'standard');
    expect(await formFields[2].getAppearance()).toBe('fill');
    expect(await formFields[3].getAppearance()).toBe('outline');
    expect(await formFields[4].getAppearance()).toBe(isMdcImplementation ? 'fill' : 'legacy');
  });

  it('should be able to get control of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].getControl() instanceof inputHarness).toBe(true);
    expect(await formFields[1].getControl() instanceof inputHarness).toBe(true);
    expect(await formFields[2].getControl() instanceof selectHarness).toBe(true);
    expect(await formFields[3].getControl() instanceof inputHarness).toBe(true);
    expect(await formFields[4].getControl() instanceof inputHarness).toBe(true);
  });

  it('should be able to get custom control of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].getControl(CustomControlHarness)).toBe(null);
    expect(await formFields[1].getControl(CustomControlHarness) instanceof CustomControlHarness)
        .toBe(true);
    expect(await formFields[2].getControl(CustomControlHarness)).toBe(null);
    expect(await formFields[3].getControl(CustomControlHarness)).toBe(null);
    expect(await formFields[4].getControl(CustomControlHarness)).toBe(null);
  });

  it('should be able to get custom control of form-field using a predicate', async () => {
    const predicate = new HarnessPredicate(CustomControlHarness, {});
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].getControl(predicate)).toBe(null);
    expect(await formFields[1].getControl(predicate) instanceof CustomControlHarness).toBe(true);
    expect(await formFields[2].getControl(predicate)).toBe(null);
    expect(await formFields[3].getControl(predicate)).toBe(null);
    expect(await formFields[4].getControl(predicate)).toBe(null);
  });

  it('should be able to check whether form-field has label', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    // The non MDC-based form-field elevates the placeholder to a floating
    // label. This is not the case in the MDC-based implementation.
    expect(await formFields[0].hasLabel()).toBe(!isMdcImplementation);
    expect(await formFields[1].hasLabel()).toBe(false);
    expect(await formFields[2].hasLabel()).toBe(true);
    expect(await formFields[3].hasLabel()).toBe(true);
    expect(await formFields[4].hasLabel()).toBe(true);
  });

  it('should be able to check whether label is floating', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    // The first form-field uses the legacy appearance. This means that the
    // placeholder will be elevated to a label. Also since there is a static
    // value, the label will float initially. The MDC implementation does not
    // elevate placeholders to floating labels.
    expect(await formFields[0].isLabelFloating()).toBe(!isMdcImplementation);
    expect(await formFields[1].isLabelFloating()).toBe(false);
    expect(await formFields[2].isLabelFloating()).toBe(false);
    expect(await formFields[3].isLabelFloating()).toBe(true);
    expect(await formFields[4].isLabelFloating()).toBe(false);

    fixture.componentInstance.shouldLabelFloat = 'always';
    expect(await formFields[4].isLabelFloating()).toBe(true);
  });

  it('should be able to check whether form-field is disabled', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isDisabled()).toBe(false);
    expect(await formFields[1].isDisabled()).toBe(false);
    expect(await formFields[2].isDisabled()).toBe(false);
    expect(await formFields[3].isDisabled()).toBe(false);
    expect(await formFields[4].isDisabled()).toBe(false);

    fixture.componentInstance.isDisabled = true;
    expect(await formFields[0].isDisabled()).toBe(true);
    expect(await formFields[1].isDisabled()).toBe(false);
    expect(await formFields[2].isDisabled()).toBe(true);
    expect(await formFields[3].isDisabled()).toBe(false);
    expect(await formFields[4].isDisabled()).toBe(false);
  });

  it('should be able to check whether form-field is auto-filled', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isAutofilled()).toBe(false);
    expect(await formFields[1].isAutofilled()).toBe(false);
    expect(await formFields[2].isAutofilled()).toBe(false);
    expect(await formFields[3].isAutofilled()).toBe(false);
    expect(await formFields[4].isAutofilled()).toBe(false);

    const autofillTriggerEvent: any = createFakeEvent('animationstart');
    autofillTriggerEvent.animationName = 'cdk-text-field-autofill-start';

    // Dispatch an "animationstart" event on the input to trigger the
    // autofill monitor.
    fixture.nativeElement.querySelector('#first-form-field input')
        .dispatchEvent(autofillTriggerEvent);

    expect(await formFields[0].isAutofilled()).toBe(true);
    expect(await formFields[1].isAutofilled()).toBe(false);
    expect(await formFields[2].isAutofilled()).toBe(false);
    expect(await formFields[3].isAutofilled()).toBe(false);
    expect(await formFields[4].isAutofilled()).toBe(false);
  });

  it('should be able to get theme color of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].getThemeColor()).toBe('primary');
    expect(await formFields[1].getThemeColor()).toBe('warn');
    expect(await formFields[2].getThemeColor()).toBe('accent');
    expect(await formFields[3].getThemeColor()).toBe('primary');
    expect(await formFields[4].getThemeColor()).toBe('primary');
  });

  it('should be able to get label of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    // In the MDC based implementation, the placeholder will not be elevated
    // to a label, and the harness will return `null`.
    expect(await formFields[0].getLabel()).toBe(isMdcImplementation ? null : 'With placeholder');
    expect(await formFields[1].getLabel()).toBe(null);
    expect(await formFields[2].getLabel()).toBe('Label');
    expect(await formFields[3].getLabel()).toBe('autocomplete_label');
    expect(await formFields[4].getLabel()).toBe('Label');
  });

  it('should be able to get error messages of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[1].getTextErrors()).toEqual([]);

    fixture.componentInstance.requiredControl.setValue('');
    dispatchFakeEvent(fixture.nativeElement.querySelector('#with-errors input'), 'blur');
    expect(await formFields[1].getTextErrors()).toEqual(['Error 1', 'Error 2']);
  });

  it('should be able to get hint messages of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[1].getTextHints()).toEqual(['Hint 1', 'Hint 2']);

    fixture.componentInstance.requiredControl.setValue('');
    dispatchFakeEvent(fixture.nativeElement.querySelector('#with-errors input'), 'blur');
    expect(await formFields[1].getTextHints()).toEqual([]);
  });

  it('should be able to get prefix container of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    const prefixContainers = await Promise.all(formFields.map(f => f.getHarnessLoaderForPrefix()));
    expect(prefixContainers[0]).not.toBe(null);
    expect(await prefixContainers[0]!.text()).toBe('prefix_textprefix_text_2');
    expect(prefixContainers[1]).toBe(null);
  });

  it('should be able to get suffix container of form-field', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    const suffixContainer = await Promise.all(formFields.map(f => f.getHarnessLoaderForSuffix()));
    expect(suffixContainer[0]).not.toBe(null);
    expect(await suffixContainer[0]!.text()).toBe('suffix_text');
    expect(suffixContainer[1]).toBe(null);
  });

  it('should be able to check if form field has been touched', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isControlTouched()).toBe(null);
    expect(await formFields[1].isControlTouched()).toBe(false);

    fixture.componentInstance.requiredControl.setValue('');
    dispatchFakeEvent(fixture.nativeElement.querySelector('#with-errors input'), 'blur');
    expect(await formFields[1].isControlTouched()).toBe(true);
  });

  it('should be able to check if form field is invalid', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isControlValid()).toBe(null);
    expect(await formFields[1].isControlValid()).toBe(true);

    fixture.componentInstance.requiredControl.setValue('');
    expect(await formFields[1].isControlValid()).toBe(false);
  });

  it('should be able to check if form field is dirty', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isControlDirty()).toBe(null);
    expect(await formFields[1].isControlDirty()).toBe(false);

    fixture.componentInstance.requiredControl.setValue('new value');
    dispatchFakeEvent(fixture.nativeElement.querySelector('#with-errors input'), 'input');
    expect(await formFields[1].isControlDirty()).toBe(true);
  });

  it('should be able to check if form field is pending async validation', async () => {
    const formFields = await loader.getAllHarnesses(formFieldHarness);
    expect(await formFields[0].isControlPending()).toBe(null);
    expect(await formFields[1].isControlPending()).toBe(false);

    fixture.componentInstance.setupAsyncValidator();
    fixture.componentInstance.requiredControl.setValue('');
    expect(await formFields[1].isControlPending()).toBe(true);
  });
}

@Component({
  template: `
    <mat-form-field id="first-form-field" [floatLabel]="shouldLabelFloat">
      <span matPrefix>prefix_text</span>
      <span matPrefix>prefix_text_2</span>
      <input matInput value="Sushi" name="favorite-food" placeholder="With placeholder"
             [disabled]="isDisabled">
      <span matSuffix>suffix_text</span>
    </mat-form-field>

    <mat-form-field appearance="standard" color="warn" id="with-errors">
      <span class="custom-control">Custom control harness</span>
      <input matInput [formControl]="requiredControl">

      <mat-error>Error 1</mat-error>
      <mat-error>Error 2</mat-error>
      <mat-hint align="start">Hint 1</mat-hint>
      <mat-hint align="end">Hint 2</mat-hint>
    </mat-form-field>

    <mat-form-field appearance="fill" color="accent">
      <mat-label>Label</mat-label>
      <mat-select [disabled]="isDisabled">
        <mat-option>First</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field floatLabel="always" appearance="outline" color="primary">
      <mat-label>autocomplete_label</mat-label>
      <input type="text" matInput [matAutocomplete]="auto">
    </mat-form-field>

    <mat-autocomplete #auto="matAutocomplete">
      <mat-option>autocomplete_option</mat-option>
    </mat-autocomplete>

    <mat-form-field id="last-form-field" [floatLabel]="shouldLabelFloat">
      <mat-label>Label</mat-label>
      <input matInput>
    </mat-form-field>
  `
})
class FormFieldHarnessTest {
  requiredControl = new FormControl('Initial value', [Validators.required]);
  shouldLabelFloat: 'always'|'auto' = 'auto';
  hasLabel = false;
  isDisabled = false;

  setupAsyncValidator() {
    this.requiredControl.setValidators(() => null);
    this.requiredControl.setAsyncValidators(() => new Promise(res => setTimeout(res, 10000)));
  }
}

class CustomControlHarness extends ComponentHarness {
  static hostSelector = '.custom-control';
}
