import {Directionality} from '@angular/cdk/bidi';
import {ENTER, COMMA, TAB} from '@angular/cdk/keycodes';
import {PlatformModule} from '@angular/cdk/platform';
import {
  createKeyboardEvent,
  dispatchKeyboardEvent,
  dispatchEvent,
} from '@angular/cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Subject} from 'rxjs';
import {MatChipInput, MatChipInputEvent} from './chip-input';
import {MatChipsModule} from './index';
import {MAT_CHIPS_DEFAULT_OPTIONS, MatChipsDefaultOptions} from './chip-default-options';
import {MatChipList} from './chip-list';


describe('MatChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MatChipInput;
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PlatformModule, MatChipsModule, MatFormFieldModule, NoopAnimationsModule],
      declarations: [TestChipInput],
      providers: [{
        provide: Directionality, useFactory: () => {
          return {
            value: dir.toLowerCase(),
            change: new Subject()
          };
        }
      }]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChipInput);
    testChipInput = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput))!;
    chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
    inputNativeElement = inputDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('emits the (chipEnd) on enter keyup', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, undefined, inputNativeElement);

      spyOn(testChipInput, 'add');

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should have a default id', () => {
      expect(inputNativeElement.getAttribute('id')).toBeTruthy();
    });

    it('should allow binding to the `placeholder` input', () => {
      expect(inputNativeElement.hasAttribute('placeholder')).toBe(false);

      testChipInput.placeholder = 'bound placeholder';
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('placeholder')).toBe('bound placeholder');
    });

    it('should propagate the dynamic `placeholder` value to the form field', () => {
      fixture.componentInstance.placeholder = 'add a chip';
      fixture.detectChanges();

      const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');

      expect(label).toBeTruthy();
      expect(label.textContent).toContain('add a chip');

      fixture.componentInstance.placeholder = 'or don\'t';
      fixture.detectChanges();

      expect(label.textContent).toContain('or don\'t');
    });

    it('should become disabled if the chip list is disabled', () => {
      expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
      expect(chipInputDirective.disabled).toBe(false);

      fixture.componentInstance.chipListInstance.disabled = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('disabled')).toBe('true');
      expect(chipInputDirective.disabled).toBe(true);
    });

    it('should allow focus to escape when tabbing forwards', fakeAsync(() => {
      const listElement: HTMLElement = fixture.nativeElement.querySelector('.mat-chip-list');

      expect(listElement.getAttribute('tabindex')).toBe('0');

      dispatchKeyboardEvent(inputNativeElement, 'keydown', TAB);
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .toBe('-1', 'Expected tabIndex to be set to -1 temporarily.');

      tick();
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex'))
        .toBe('0', 'Expected tabIndex to be reset back to 0');
    }));

    it('should not allow focus to escape when tabbing backwards', fakeAsync(() => {
      const listElement: HTMLElement = fixture.nativeElement.querySelector('.mat-chip-list');
      const event = createKeyboardEvent('keydown', TAB);
      Object.defineProperty(event, 'shiftKey', {get: () => true});

      expect(listElement.getAttribute('tabindex')).toBe('0');

      dispatchEvent(inputNativeElement, event);
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex')).toBe('0', 'Expected tabindex to remain 0');

      tick();
      fixture.detectChanges();

      expect(listElement.getAttribute('tabindex')).toBe('0', 'Expected tabindex to remain 0');
    }));

    it('should be aria-required if the chip list is required', () => {
      expect(inputNativeElement.hasAttribute('aria-required')).toBe(false);

      fixture.componentInstance.required = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('aria-required')).toBe('true');
    });

  });

  describe('[addOnBlur]', () => {
    it('allows (chipEnd) when true', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = true;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('disallows (chipEnd) when false', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = false;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).not.toHaveBeenCalled();
    });
  });

  describe('[separatorKeyCodes]', () => {
    it('does not emit (chipEnd) when a non-separator key is pressed', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, undefined, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

    it('emits (chipEnd) when a custom separator keys is pressed', () => {
      let COMMA_EVENT = createKeyboardEvent('keydown', COMMA, undefined, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits accepts the custom separator keys in a Set', () => {
      let COMMA_EVENT = createKeyboardEvent('keydown', COMMA, undefined, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = new Set([COMMA]);
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits (chipEnd) when the separator keys are configured globally', () => {
      fixture.destroy();

      TestBed
        .resetTestingModule()
        .configureTestingModule({
          imports: [MatChipsModule, MatFormFieldModule, PlatformModule, NoopAnimationsModule],
          declarations: [TestChipInput],
          providers: [{
            provide: MAT_CHIPS_DEFAULT_OPTIONS,
            useValue: ({separatorKeyCodes: [COMMA]} as MatChipsDefaultOptions)
          }]
        })
        .compileComponents();

      fixture = TestBed.createComponent(TestChipInput);
      testChipInput = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput))!;
      chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
      inputNativeElement = inputDebugElement.nativeElement;

      spyOn(testChipInput, 'add');
      fixture.detectChanges();

      chipInputDirective._keydown(
          createKeyboardEvent('keydown', COMMA, undefined, inputNativeElement));
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should not emit the chipEnd event if a separator is pressed with a modifier key', () => {
      const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, undefined, inputNativeElement);
      Object.defineProperty(ENTER_EVENT, 'shiftKey', {get: () => true});
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [ENTER];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

  });
});

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list #chipList [required]="required">
        <mat-chip>Hello</mat-chip>
        <input matInput [matChipInputFor]="chipList"
                  [matChipInputAddOnBlur]="addOnBlur"
                  (matChipInputTokenEnd)="add($event)"
                  [placeholder]="placeholder" />
      </mat-chip-list>
    </mat-form-field>
  `
})
class TestChipInput {
  @ViewChild(MatChipList) chipListInstance: MatChipList;
  addOnBlur = false;
  required = false;
  placeholder = '';

  add(_: MatChipInputEvent) {
  }
}
