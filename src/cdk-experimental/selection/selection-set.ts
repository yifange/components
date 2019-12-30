import {TrackByFunction} from '@angular/core';
import {Subject} from 'rxjs';

interface TrackBySelection<T> {
  isSelected(value: SelectableWithIndex<T>): boolean;
  select(...values: Array<SelectableWithIndex<T>>): void;
  deselect(...values: Array<SelectableWithIndex<T>>): void;
  changed$: Subject<SelectionChange<T>>;
}

/**
 * A selectable value with an optional index. The index is required when the selection is used with
 * `trackBy`.
 */
export interface SelectableWithIndex<T> {
  value: T;
  index?: number;
}

/**
 * Represents the change in the selection set.
 */
export interface SelectionChange<T> {
  added?: Array<SelectableWithIndex<T>>;
  removed?: Array<SelectableWithIndex<T>>;
}

/**
 * Maintains a set of selected items. Support selecting and deselecting items, and checking if a
 * value is selected.
 * When constructed with a `trackByFn`, all the items will be identified by applying the `trackByFn`
 * on them. Because `trackBnFn` requires the index of the item to be passed in, the `index` field is
 * expected to be set when calling `isSelected`, `select` and `deselect`.
 */
export class SelectionSet<T> implements TrackBySelection<T> {
  private selection = new Set<T|ReturnType<TrackByFunction<T>>>();
  changed$ = new Subject<SelectionChange<T>>();

  constructor(private trackByFn?: TrackByFunction<T>) {}

  isSelected(value: SelectableWithIndex<T>): boolean {
    return this.selection.has(this._getTrackedByValue(value));
  }

  select(...selects: Array<SelectableWithIndex<T>>) {
    const toSelect: Array<SelectableWithIndex<T>> = [];
    for (const select of selects) {
      if (this.isSelected(select)) {
        continue;
      }

      toSelect.push(select);
      this._markSelected(this._getTrackedByValue(select));
    }

    this.changed$.next({added: toSelect});
  }

  deselect(...selects: Array<SelectableWithIndex<T>>) {
    const toDeselect: Array<SelectableWithIndex<T>> = [];

    for (const select of selects) {
      if (!this.isSelected(select)) {
        continue;
      }
      toDeselect.push(select);
      this._markDeselected(this._getTrackedByValue(select));
    }

    this.changed$.next({removed: toDeselect});
  }

  private _markSelected(select: T|ReturnType<TrackByFunction<T>>) {
    this.selection.add(select);
  }

  private _markDeselected(select: T|ReturnType<TrackByFunction<T>>) {
    this.selection.delete(select);
  }

  private _getTrackedByValue(select: SelectableWithIndex<T>) {
    if (!this.trackByFn) {
      return select.value;
    }

    if (select.index == null) {
      throw new Error('index required when trackByFn is used.');
    }

    return this.trackByFn(select.index, select.value);
  }
}
