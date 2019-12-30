import {CollectionViewer, DataSource, isDataSource, ListRange} from '@angular/cdk/collections';
import {
  AfterContentChecked,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TrackByFunction
} from '@angular/core';
import {Observable, of as observableOf, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[cdkSelection]', exportAs: 'cdkSelection',
}
export class CdkSelection<T> implements OnInit, AfterContentChecked, CollectionViewer, OnDestroy {
  viewChange: Observable<ListRange>;

  @Input()
  get dataSource(): TableDataSource<T> {
    return this._dataSource;
  }
  set dataSource(dataSource: TableDataSource<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: TableDataSource<T>;

  @Input()
  get trackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }
  set trackBy(fn: TrackByFunction<T>) {
    this._trackByFn = fn;
  }
  private _trackByFn: TrackByFunction<T>;

  @Input()
  get cdkSelectionMultiple(): boolean {
    return this._multiple;
  }
  set cdkSelectionMultiple(multiple: boolean) {
    this._multiple = multiple;
  }
  private _multiple: boolean;

  @Output() cdkSelectionChange = new EventEmitter<SelectionChange<T>>();

  /** Latest data provided byt he data source. */
  private _data: T[]|ReadonlyArray<T>;

  /** Subscription that listens fo rthe data provided by the data source.  */
  private _renderChangeSubscription: Subscription|null;

  private _destroyed$ = new Subject<void>();

  private _selection: SelectionSet<T>;

  private _switchDataSource(dataSource: TableDataSource<T>) {
    this._data = [];

    if (isDataSource(this._dataSource)) {
      this._dataSource.disconnect(this);
    }

    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    this._dataSource = dataSource;
  }

  private _observeRenderChanges() {
    if (!this._dataSource) {
      return;
    }

    let dataStream: Observable<T[]|ReadonlyArray<T>>|undefined;

    if (isDataSource(this._dataSource)) {
      dataStream = this._dataSource.connect(this);
    } else if (this._dataSource instanceof Observable) {
      dataStream = this._dataSource;
    } else if (Array.isArray(this._dataSource)) {
      dataStream = observableOf(this._dataSource);
    }

    if (dataStream == null) {
      throw new Error('Unknown data source');
    }

    this._renderChangeSubscription =
        dataStream.pipe(takeUntil(this._destroyed$)).subscribe((data) => {
          this._data = data || [];
        });
  }

  ngOnInit() {
    this._selection = new SelectionSet<T>(this._trackByFn);
    this._selection.changed$.pipe(takeUntil(this._destroyed$)).subscribe((change) => {
      this.updateSelectAllState();
      this.cdkSelectionChange.emit(change);
    });
  }

  ngAfterContentChecked() {
    if (this._dataSource && !this._renderChangeSubscription) {
      this._observeRenderChanges();
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();

    if (isDataSource(this._dataSource)) {
      this._dataSource.disconnect(this);
    }
  }

  toggleSelection(value: T, index?: number) {
    if (this.isSelected(value, index)) {
      this._selection.deselect({value, index});
    } else {
      this._selection.select({value, index});
    }
  }

  toggleSelectAll() {
    if (!this._multiple) {
      return;
    }

    if (this.selectAllState === 'none' || this.selectAllState === 'partial') {
      this.toggleSelectAll();
    } else {
      this.clearAll();
    }
  }

  isSelected(value: T, index?: number) {
    return this._selection.isSelected({value, index});
  }

  isAllSelected() {
    return this._data.every((value, index) => this._selection.isSelected({value, index}));
  }

  isPartialSelected() {
    return !this.isAllSelected() &&
        this._data.some((value, index) => this._selection.isSelected({value, index}));
  }

  private selectAll() {
    const toSelect = this._data.map((value, index) => ({value, index}));
    this._selection.select(...toSelect);
  }

  private clearAll() {
    const toDeselect = this._data.map((value, index) => ({value, index}));
    this._selection.deselect(...toDeselect);
  }

  private updateSelectAllState() {
    if (this.isAllSelected()) {
      this.selectAllState = 'all';
    } else if (this.isPartialSelected()) {
      this.selectAllState = 'partial';
    } else {
      this.selectAllState = 'none';
    }
  }

  selectAllState: SelectAllState = 'none';
}


type SelectAllState = 'all' | 'none' | 'partial';
type TableDataSource<T> = DataSource<T> | Observable<ReadonlyArray<T> | T[]> | ReadonlyArray<T> | T[];
