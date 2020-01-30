/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Optional,
  Directive,
  ChangeDetectorRef,
  SkipSelf,
  AfterContentInit,
  Inject,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {CdkDrag, CDK_DROP_LIST} from './drag';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent} from '../drag-events';
import {CdkDropListGroup} from './drop-list-group';
import {DropListRef} from '../drop-list-ref';
import {DragRef} from '../drag-ref';
import {DragDrop} from '../drag-drop';
import {DropListOrientation, DragAxis, DragDropConfig, CDK_DRAG_CONFIG} from './config';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;

/**
 * Internal compile-time-only representation of a `CdkDropList`.
 * Used to avoid circular import issues between the `CdkDropList` and the `CdkDrag`.
 * @docs-private
 */
export interface CdkDropListInternal extends CdkDropList {}

/** Container that wraps a set of draggable items. */
@Directive({
  selector: '[cdkDropList], cdk-drop-list',
  exportAs: 'cdkDropList',
  providers: [
    // Prevent child drop lists from picking up the same group as their parent.
    {provide: CdkDropListGroup, useValue: undefined},
    {provide: CDK_DROP_LIST, useExisting: CdkDropList},
  ],
  host: {
    'class': 'cdk-drop-list',
    '[id]': 'id',
    '[class.cdk-drop-list-disabled]': 'disabled',
    '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
    '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
  }
})
export class CdkDropList<T = any> implements AfterContentInit, OnDestroy {
  /** Emits when the list has been destroyed. */
  private _destroyed = new Subject<void>();

  /** Keeps track of the drop lists that are currently on the page. */
  private static _dropLists: CdkDropList[] = [];

  /** Reference to the underlying drop list instance. */
  _dropListRef: DropListRef<CdkDropList<T>>;

  /** Draggable items in the container. */
  @ContentChildren(CdkDrag, {descendants: true}) _draggables: QueryList<CdkDrag>;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input('cdkDropListConnectedTo')
  connectedTo: (CdkDropList | string)[] | CdkDropList | string = [];

  /** Arbitrary data to attach to this container. */
  @Input('cdkDropListData') data: T;

  /** Direction in which the list is oriented. */
  @Input('cdkDropListOrientation') orientation: DropListOrientation;

  /**
   * Unique ID for the drop zone. Can be used as a reference
   * in the `connectedTo` of another `CdkDropList`.
   */
  @Input() id: string = `cdk-drop-list-${_uniqueIdCounter++}`;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input('cdkDropListLockAxis') lockAxis: DragAxis;

  /** Whether starting a dragging sequence from this container is disabled. */
  @Input('cdkDropListDisabled')
  get disabled(): boolean {
    return this._disabled || (!!this._group && this._group.disabled);
  }
  set disabled(value: boolean) {
    // Usually we sync the directive and ref state right before dragging starts, in order to have
    // a single point of failure and to avoid having to use setters for everything. `disabled` is
    // a special case, because it can prevent the `beforeStarted` event from firing, which can lock
    // the user in a disabled state, so we also need to sync it as it's being set.
    this._dropListRef.disabled = this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  /** Whether sorting within this drop list is disabled. */
  @Input('cdkDropListSortingDisabled')
  sortingDisabled: boolean;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input('cdkDropListEnterPredicate')
  enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean = () => true

  /** Whether to auto-scroll the view when the user moves their pointer close to the edges. */
  @Input('cdkDropListAutoScrollDisabled')
  autoScrollDisabled: boolean;

  /** Emits when the user drops an item inside the container. */
  @Output('cdkDropListDropped')
  dropped: EventEmitter<CdkDragDrop<T, any>> = new EventEmitter<CdkDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('cdkDropListEntered')
  entered: EventEmitter<CdkDragEnter<T>> = new EventEmitter<CdkDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('cdkDropListExited')
  exited: EventEmitter<CdkDragExit<T>> = new EventEmitter<CdkDragExit<T>>();

  /** Emits as the user is swapping items while actively dragging. */
  @Output('cdkDropListSorted')
  sorted: EventEmitter<CdkDragSortEvent<T>> = new EventEmitter<CdkDragSortEvent<T>>();

  constructor(
      /** Element that the drop list is attached to. */
      public element: ElementRef<HTMLElement>, dragDrop: DragDrop,
      private _changeDetectorRef: ChangeDetectorRef, @Optional() private _dir?: Directionality,
      @Optional() @SkipSelf() private _group?: CdkDropListGroup<CdkDropList>,

      /**
       * @deprecated _scrollDispatcher parameter to become required.
       * @breaking-change 11.0.0
       */
      private _scrollDispatcher?: ScrollDispatcher,
      @Optional() @Inject(CDK_DRAG_CONFIG) config?: DragDropConfig) {
    this._dropListRef = dragDrop.createDropList(element);
    this._dropListRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    this._dropListRef.enterPredicate = (drag: DragRef<CdkDrag>, drop: DropListRef<CdkDropList>) => {
      return this.enterPredicate(drag.data, drop.data);
    };

    this._setupInputSyncSubscription(this._dropListRef);
    this._handleEvents(this._dropListRef);
    CdkDropList._dropLists.push(this);

    if (_group) {
      _group._items.add(this);
    }
  }

  ngAfterContentInit() {
    // @breaking-change 11.0.0 Remove null check for _scrollDispatcher once it's required.
    if (this._scrollDispatcher) {
      const scrollableParents = this._scrollDispatcher
        .getAncestorScrollContainers(this.element)
        .map(scrollable => scrollable.getElementRef().nativeElement);
      this._dropListRef.withScrollableParents(scrollableParents);
    }

    this._draggables.changes
      .pipe(startWith(this._draggables), takeUntil(this._destroyed))
      .subscribe((items: QueryList<CdkDrag>) => {
        this._dropListRef.withItems(items.reduce((filteredItems, drag) => {
          if (drag.dropContainer === this) {
            filteredItems.push(drag._dragRef);
          }

          return filteredItems;
        }, [] as DragRef[]));
      });
  }

  ngOnDestroy() {
    const index = CdkDropList._dropLists.indexOf(this);

    if (index > -1) {
      CdkDropList._dropLists.splice(index, 1);
    }

    if (this._group) {
      this._group._items.delete(this);
    }

    this._dropListRef.dispose();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Starts dragging an item.
   * @deprecated No longer being used. To be removed.
   * @breaking-change 10.0.0
   */
  start(): void {
    this._dropListRef.start();
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   * @param isPointerOverContainer Whether the user's pointer was over the
   *    container when the item was dropped.
   *
   * @deprecated No longer being used. To be removed.
   * @breaking-change 10.0.0
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer: CdkDropList,
    isPointerOverContainer: boolean): void {
    this._dropListRef.drop(item._dragRef, currentIndex, previousContainer._dropListRef,
        isPointerOverContainer, {x: 0, y: 0});
  }

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @deprecated No longer being used. To be removed.
   * @breaking-change 10.0.0
   */
  enter(item: CdkDrag, pointerX: number, pointerY: number): void {
    this._dropListRef.enter(item._dragRef, pointerX, pointerY);
  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   * @deprecated No longer being used. To be removed.
   * @breaking-change 10.0.0
   */
  exit(item: CdkDrag): void {
    this._dropListRef.exit(item._dragRef);
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   * @deprecated No longer being used. To be removed.
   * @breaking-change 10.0.0
   */
  getItemIndex(item: CdkDrag): number {
    return this._dropListRef.getItemIndex(item._dragRef);
  }

  /** Syncs the inputs of the CdkDropList with the options of the underlying DropListRef. */
  private _setupInputSyncSubscription(ref: DropListRef<CdkDropList>) {
    if (this._dir) {
      this._dir.change
        .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
        .subscribe(value => ref.withDirection(value));
    }

    ref.beforeStarted.subscribe(() => {
      const siblings = coerceArray(this.connectedTo).map(drop => {
        return typeof drop === 'string' ?
            CdkDropList._dropLists.find(list => list.id === drop)! : drop;
      });

      if (this._group) {
        this._group._items.forEach(drop => {
          if (siblings.indexOf(drop) === -1) {
            siblings.push(drop);
          }
        });
      }

      ref.disabled = this.disabled;
      ref.lockAxis = this.lockAxis;
      ref.sortingDisabled = coerceBooleanProperty(this.sortingDisabled);
      ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
      ref
        .connectedTo(siblings.filter(drop => drop && drop !== this).map(list => list._dropListRef))
        .withOrientation(this.orientation);
    });
  }

  /** Handles events from the underlying DropListRef. */
  private _handleEvents(ref: DropListRef<CdkDropList>) {
    ref.beforeStarted.subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container: this,
        item: event.item.data,
        currentIndex: event.currentIndex
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: this,
        item: event.item.data
      });
      this._changeDetectorRef.markForCheck();
    });

    ref.sorted.subscribe(event => {
      this.sorted.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        container: this,
        item: event.item.data
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        previousContainer: event.previousContainer.data,
        container: event.container.data,
        item: event.item.data,
        isPointerOverContainer: event.isPointerOverContainer,
        distance: event.distance
      });

      // Mark for check since all of these events run outside of change
      // detection and we're not guaranteed for something else to have triggered it.
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Assigns the default input values based on a provided config object. */
  private _assignDefaults(config: DragDropConfig) {
    const {
      lockAxis, draggingDisabled, sortingDisabled, listAutoScrollDisabled, listOrientation
    } = config;

    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.sortingDisabled = sortingDisabled == null ? false : sortingDisabled;
    this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
    this.orientation = listOrientation || 'vertical';

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_sortingDisabled: BooleanInput;
  static ngAcceptInputType_autoScrollDisabled: BooleanInput;
}
