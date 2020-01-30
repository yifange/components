import {Directionality} from '@angular/cdk/bidi';
import {createFakeEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {MatChip, MatChipEvent, MatChipSet, MatChipsModule} from './index';


describe('MDC-based MatChip', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChip;
  let globalRippleOptions: RippleGlobalOptions;

  let dir = 'ltr';

  beforeEach(async(() => {
    globalRippleOptions = {};
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        BasicChip,
        SingleChip,
        BasicChipWithStaticTabindex,
        BasicChipWithBoundTabindex,
      ],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
        {provide: Directionality, useFactory: () => ({
          value: dir,
          change: new Subject()
        })},
      ]
    });

    TestBed.compileComponents();
  }));

  describe('MatBasicChip', () => {
    it('adds the `mat-mdc-basic-chip` class', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.classList).toContain('mat-mdc-basic-chip');
    });

    it('should be able to set a static tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithStaticTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('3');
    });

    it('should be able to set a static tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithStaticTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('3');
    });

    it('should be able to set a dynamic tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithBoundTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('12');

      fixture.componentInstance.tabindex = 15;
      fixture.detectChanges();

      expect(chip.getAttribute('tabindex')).toBe('15');
    });
  });

  describe('MatChip', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChip>(MatChip);
      testComponent = fixture.debugElement.componentInstance;
    });

    it('adds the `mat-chip` class', () => {
      expect(chipNativeElement.classList).toContain('mat-mdc-chip');
    });

    it('does not add the `mat-basic-chip` class', () => {
      expect(chipNativeElement.classList).not.toContain('mat-mdc-basic-chip');
    });

    it('emits destroy on destruction', () => {
      spyOn(testComponent, 'chipDestroy').and.callThrough();

      // Force a destroy callback
      testComponent.shouldShow = false;
      fixture.detectChanges();

      expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
    });

    it('allows color customization', () => {
      expect(chipNativeElement.classList).toContain('mat-primary');

      testComponent.color = 'warn';
      fixture.detectChanges();

      expect(chipNativeElement.classList).not.toContain('mat-primary');
      expect(chipNativeElement.classList).toContain('mat-warn');
    });

    it('allows removal', () => {
      spyOn(testComponent, 'chipRemove');

      chipInstance.remove();
      fixture.detectChanges();

      const fakeEvent = createFakeEvent('transitionend');
      (fakeEvent as any).propertyName = 'width';
      chipNativeElement.dispatchEvent(fakeEvent);

      expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
    });

    it('should make the chip non-focusable when it is removed', () => {
      chipInstance.remove();
      fixture.detectChanges();

      const fakeEvent = createFakeEvent('transitionend');
      (fakeEvent as any).propertyName = 'width';
      chipNativeElement.dispatchEvent(fakeEvent);

      expect(chipNativeElement.style.display).toBe('none');
    });

    it('should be able to disable ripples through ripple global options at runtime', () => {
      expect(chipInstance.rippleDisabled).toBe(false, 'Expected chip ripples to be enabled.');

      globalRippleOptions.disabled = true;

      expect(chipInstance.rippleDisabled).toBe(true, 'Expected chip ripples to be disabled.');
    });

    it('should update the aria-label for disabled chips', () => {
      expect(chipNativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.disabled = true;
      fixture.detectChanges();

      expect(chipNativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not be focusable', () => {
      expect(chipNativeElement.getAttribute('tabindex')).toBeFalsy();
    });

    it('should return the chip text if value is undefined', () => {
      expect(chipInstance.value.trim()).toBe(fixture.componentInstance.name);
    });

    it('should return the chip value if defined', () => {
      fixture.componentInstance.value = 123;
      fixture.detectChanges();

      expect(chipInstance.value).toBe(123);
    });

    it('should return the chip value if set to null', () => {
      fixture.componentInstance.value = null;
      fixture.detectChanges();

      expect(chipInstance.value).toBeNull();
    });
  });
});

@Component({
  template: `
    <mat-chip-set>
      <div *ngIf="shouldShow">
        <mat-chip [removable]="removable"
                 [color]="color" [disabled]="disabled"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)" [value]="value">
          {{name}}
        </mat-chip>
      </div>
    </mat-chip-set>`
})
class SingleChip {
  @ViewChild(MatChipSet) chipList: MatChipSet;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;
  value: any;

  chipFocus: (event?: MatChipEvent) => void = () => {};
  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
}

@Component({
  template: `<mat-basic-chip>Hello</mat-basic-chip>`
})
class BasicChip {
}

@Component({
  template: `<mat-basic-chip tabindex="3">Hello</mat-basic-chip>`
})
class BasicChipWithStaticTabindex {
}

@Component({
  template: `<mat-basic-chip [tabIndex]="tabindex">Hello</mat-basic-chip>`
})
class BasicChipWithBoundTabindex {
  tabindex = 12;
}
