import {createFakeEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChip, MatChipsModule} from './index';

describe('MDC-based Chip Remove', () => {
  let fixture: ComponentFixture<TestChip>;
  let testChip: TestChip;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        TestChip
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('should apply the `mat-mdc-chip-remove` CSS class', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      expect(buttonElement.classList).toContain('mat-mdc-chip-remove');
    });

    it('should start MDC exit animation on click', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();

      buttonElement.click();
      fixture.detectChanges();

      expect(chipNativeElement.classList.contains('mdc-chip--exit')).toBe(true);
    });

    it ('should emit (removed) event when exit animation is complete', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();

      spyOn(testChip, 'didRemove');
      buttonElement.click();
      fixture.detectChanges();

      const fakeEvent = createFakeEvent('transitionend');
      (fakeEvent as any).propertyName = 'width';
      chipNativeElement.dispatchEvent(fakeEvent);

      expect(testChip.didRemove).toHaveBeenCalled();
    });

    it('should not start MDC exit animation if parent chip is disabled', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      testChip.disabled = true;
      fixture.detectChanges();

      buttonElement.click();
      fixture.detectChanges();

      expect(chipNativeElement.classList.contains('mdc-chip--exit')).toBe(false);
    });

    it('should not make the element aria-hidden when it is focusable', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      expect(buttonElement.getAttribute('tabindex')).toBe('0');
      expect(buttonElement.hasAttribute('aria-hidden')).toBe(false);
    });

  });
});

@Component({
  template: `
    <mat-chip
      [removable]="removable"
      [disabled]="disabled"
      (removed)="didRemove()"><button matChipRemove></button></mat-chip>
  `
})
class TestChip {
  removable: boolean;
  disabled = false;

  didRemove() {}
}

