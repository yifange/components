import {TrackByFunction} from '@angular/core';
import {Subject} from 'rxjs';

interface TrackBySelection<T> {
  isSelected(value: SelectableWithIndex<T>): boolean;
  select(...values: Array<SelectableWithIndex<T>>): void;
  deselect(...values: Array<SelectableWithIndex<T>>): void;
  changed$: Subject<SelectionChange<T>>;
}

interface SelectableWithIndex<T> {
  value: T;
  index?: number;
}

export interface SelectionChange<T> {
  added?: Array<SelectableWithIndex<T>>;
  removed?: Array<SelectableWithIndex<T>>;
}

export class SelectionSet<T> implements TrackBySelection<T> {
  private selection = new Set<T|ReturnType<TrackByFunction<T>>>();
  changed$ = new Subject<SelectionChange<T>>();

  constructor(private trackByFn?: TrackByFunction<T>) {}
}
