import {SelectionChange} from '@angular/cdk-experimental/selection/selection-set';
import {Component, OnDestroy} from '@angular/core';
import {ReplaySubject} from 'rxjs';

/**
 * @title CDK Selection on a simple list.
 */
@Component({
  selector: 'cdk-selection-list-example',
  templateUrl: 'cdk-selection-list-example.html',
})
export class CdkSelectionListExample implements OnDestroy {
  private readonly destroyed$ = new ReplaySubject(1);

  data = [
    'Hydrogen',   'Helium',   'Lithium',  'Beryllium', 'Boron',     'Carbon',   'Nitrogen',
    'Oxygen',     'Fluorine', 'Neon',     'Sodium',    'Magnesium', 'Aluminum', 'Silicon',
    'Phosphorus', 'Sulfur',   'Chlorine', 'Argon',     'Potassium', 'Calcium',
  ];

  symbols = [
    'H',  'He', 'Li', 'Be', 'B', 'C', 'N',  'O',  'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'
  ];

  selectionSet1 = new Set<string>();
  selectionSet2 = new Set<string>();
  selectionSet3 = new Set<string>();

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectionChanged(event: SelectionChange<string>, selectionSet: Set<string>) {
    for (const added of event.added || []) {
      selectionSet.add(added.value);
    }

    for (const removed of event.removed || []) {
      selectionSet.delete(removed.value);
    }
  }

  trackByFn(index: number, value: string) {
    return index;
  }

  changeElementName() {
    this.data = this.symbols;
  }
}
