import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {AfterContentChecked, Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

@Directive({
  selector: '[cdkSelection]', exportAs: 'cdkSelection',
}
export class CdkSelection<T> implements OnInit, AfterContentChecked, CollectionViewer, OnDestroy {
  @Input()
  get dataSource(): DataSource<T>|Observable<ReadonlyArray<T>|T[]>|ReadonlyArray<T>|T[] {
    return this._dataSource;
  }
  set dataSource(dataSource: DataSource<T>|Observable<ReadonlyArray<T>|T[]>|ReadonlyArray<T>|T[]) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }
  private _dataSource: DataSource<T>|Observable<ReadonlyArray<T>|T[]>|ReadonlyArray<T>|T[];
}
