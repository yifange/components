export declare const CDK_DRAG_CONFIG: InjectionToken<DragDropConfig>;

export declare function CDK_DRAG_CONFIG_FACTORY(): DragDropConfig;

export declare const CDK_DROP_LIST: InjectionToken<CdkDropList>;

export declare class CdkDrag<T = any> implements AfterViewInit, OnChanges, OnDestroy {
    _dragRef: DragRef<CdkDrag<T>>;
    _handles: QueryList<CdkDragHandle>;
    _placeholderTemplate: CdkDragPlaceholder;
    _previewTemplate: CdkDragPreview;
    boundaryElement: string | ElementRef<HTMLElement> | HTMLElement;
    constrainPosition?: (point: Point, dragRef: DragRef) => Point;
    data: T;
    get disabled(): boolean;
    set disabled(value: boolean);
    dragStartDelay: DragStartDelay;
    dropContainer: CdkDropList;
    dropped: EventEmitter<CdkDragDrop<any>>;
    element: ElementRef<HTMLElement>;
    ended: EventEmitter<CdkDragEnd>;
    entered: EventEmitter<CdkDragEnter<any>>;
    exited: EventEmitter<CdkDragExit<any>>;
    freeDragPosition: {
        x: number;
        y: number;
    };
    lockAxis: DragAxis;
    moved: Observable<CdkDragMove<T>>;
    previewClass: string | string[];
    released: EventEmitter<CdkDragRelease>;
    rootElementSelector: string;
    started: EventEmitter<CdkDragStart>;
    constructor(
    element: ElementRef<HTMLElement>,
    dropContainer: CdkDropList, _document: any, _ngZone: NgZone, _viewContainerRef: ViewContainerRef, config: DragDropConfig, _dir: Directionality, dragDrop: DragDrop, _changeDetectorRef: ChangeDetectorRef);
    getFreeDragPosition(): {
        readonly x: number;
        readonly y: number;
    };
    getPlaceholderElement(): HTMLElement;
    getRootElement(): HTMLElement;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    reset(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDrag<any>, "[cdkDrag]", ["cdkDrag"], { "data": "cdkDragData"; "lockAxis": "cdkDragLockAxis"; "rootElementSelector": "cdkDragRootElement"; "boundaryElement": "cdkDragBoundary"; "dragStartDelay": "cdkDragStartDelay"; "freeDragPosition": "cdkDragFreeDragPosition"; "disabled": "cdkDragDisabled"; "constrainPosition": "cdkDragConstrainPosition"; "previewClass": "cdkDragPreviewClass"; }, { "started": "cdkDragStarted"; "released": "cdkDragReleased"; "ended": "cdkDragEnded"; "entered": "cdkDragEntered"; "exited": "cdkDragExited"; "dropped": "cdkDragDropped"; "moved": "cdkDragMoved"; }, ["_previewTemplate", "_placeholderTemplate", "_handles"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDrag<any>>;
}

export interface CdkDragDrop<T, O = T> {
    container: CdkDropList<T>;
    currentIndex: number;
    distance: {
        x: number;
        y: number;
    };
    isPointerOverContainer: boolean;
    item: CdkDrag;
    previousContainer: CdkDropList<O>;
    previousIndex: number;
}

export interface CdkDragEnd<T = any> {
    distance: {
        x: number;
        y: number;
    };
    source: CdkDrag<T>;
}

export interface CdkDragEnter<T = any, I = T> {
    container: CdkDropList<T>;
    currentIndex: number;
    item: CdkDrag<I>;
}

export interface CdkDragExit<T = any, I = T> {
    container: CdkDropList<T>;
    item: CdkDrag<I>;
}

export declare class CdkDragHandle implements OnDestroy {
    _parentDrag: {} | undefined;
    _stateChanges: Subject<CdkDragHandle>;
    get disabled(): boolean;
    set disabled(value: boolean);
    element: ElementRef<HTMLElement>;
    constructor(element: ElementRef<HTMLElement>, parentDrag?: any);
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDragHandle, "[cdkDragHandle]", never, { "disabled": "cdkDragHandleDisabled"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDragHandle>;
}

export interface CdkDragMove<T = any> {
    delta: {
        x: -1 | 0 | 1;
        y: -1 | 0 | 1;
    };
    distance: {
        x: number;
        y: number;
    };
    event: MouseEvent | TouchEvent;
    pointerPosition: {
        x: number;
        y: number;
    };
    source: CdkDrag<T>;
}

export declare class CdkDragPlaceholder<T = any> {
    data: T;
    templateRef: TemplateRef<T>;
    constructor(templateRef: TemplateRef<T>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDragPlaceholder<any>, "ng-template[cdkDragPlaceholder]", never, { "data": "data"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDragPlaceholder<any>>;
}

export declare class CdkDragPreview<T = any> {
    data: T;
    templateRef: TemplateRef<T>;
    constructor(templateRef: TemplateRef<T>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDragPreview<any>, "ng-template[cdkDragPreview]", never, { "data": "data"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDragPreview<any>>;
}

export interface CdkDragRelease<T = any> {
    source: CdkDrag<T>;
}

export interface CdkDragSortEvent<T = any, I = T> {
    container: CdkDropList<T>;
    currentIndex: number;
    item: CdkDrag<I>;
    previousIndex: number;
}

export interface CdkDragStart<T = any> {
    source: CdkDrag<T>;
}

export declare class CdkDropList<T = any> implements AfterContentInit, OnDestroy {
    _draggables: QueryList<CdkDrag>;
    _dropListRef: DropListRef<CdkDropList<T>>;
    autoScrollDisabled: boolean;
    connectedTo: (CdkDropList | string)[] | CdkDropList | string;
    data: T;
    get disabled(): boolean;
    set disabled(value: boolean);
    dropped: EventEmitter<CdkDragDrop<T, any>>;
    element: ElementRef<HTMLElement>;
    enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean;
    entered: EventEmitter<CdkDragEnter<T>>;
    exited: EventEmitter<CdkDragExit<T>>;
    id: string;
    lockAxis: DragAxis;
    orientation: DropListOrientation;
    sorted: EventEmitter<CdkDragSortEvent<T>>;
    sortingDisabled: boolean;
    constructor(
    element: ElementRef<HTMLElement>, dragDrop: DragDrop, _changeDetectorRef: ChangeDetectorRef, _dir?: Directionality | undefined, _group?: CdkDropListGroup<CdkDropList<any>> | undefined,
    _scrollDispatcher?: ScrollDispatcher | undefined, config?: DragDropConfig);
    drop(item: CdkDrag, currentIndex: number, previousContainer: CdkDropList, isPointerOverContainer: boolean): void;
    enter(item: CdkDrag, pointerX: number, pointerY: number): void;
    exit(item: CdkDrag): void;
    getItemIndex(item: CdkDrag): number;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    start(): void;
    static ngAcceptInputType_autoScrollDisabled: BooleanInput;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_sortingDisabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDropList<any>, "[cdkDropList], cdk-drop-list", ["cdkDropList"], { "connectedTo": "cdkDropListConnectedTo"; "data": "cdkDropListData"; "orientation": "cdkDropListOrientation"; "id": "id"; "lockAxis": "cdkDropListLockAxis"; "disabled": "cdkDropListDisabled"; "sortingDisabled": "cdkDropListSortingDisabled"; "enterPredicate": "cdkDropListEnterPredicate"; "autoScrollDisabled": "cdkDropListAutoScrollDisabled"; }, { "dropped": "cdkDropListDropped"; "entered": "cdkDropListEntered"; "exited": "cdkDropListExited"; "sorted": "cdkDropListSorted"; }, ["_draggables"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDropList<any>>;
}

export declare class CdkDropListGroup<T> implements OnDestroy {
    readonly _items: Set<T>;
    get disabled(): boolean;
    set disabled(value: boolean);
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkDropListGroup<any>, "[cdkDropListGroup]", ["cdkDropListGroup"], { "disabled": "cdkDropListGroupDisabled"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkDropListGroup<any>>;
}

export declare function copyArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;

export declare type DragAxis = 'x' | 'y';

export declare type DragConstrainPosition = (point: Point, dragRef: DragRef) => Point;

export declare class DragDrop {
    constructor(_document: any, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>);
    createDrag<T = any>(element: ElementRef<HTMLElement> | HTMLElement, config?: DragRefConfig): DragRef<T>;
    createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListRef<T>;
    static ɵfac: i0.ɵɵFactoryDef<DragDrop>;
    static ɵprov: i0.ɵɵInjectableDef<DragDrop>;
}

export interface DragDropConfig extends Partial<DragRefConfig> {
    boundaryElement?: string;
    constrainPosition?: DragConstrainPosition;
    dragStartDelay?: DragStartDelay;
    draggingDisabled?: boolean;
    listAutoScrollDisabled?: boolean;
    listOrientation?: DropListOrientation;
    lockAxis?: DragAxis;
    previewClass?: string | string[];
    rootElementSelector?: string;
    sortingDisabled?: boolean;
}

export declare class DragDropModule {
    static ɵinj: i0.ɵɵInjectorDef<DragDropModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<DragDropModule, [typeof i1.CdkDropList, typeof i2.CdkDropListGroup, typeof i3.CdkDrag, typeof i4.CdkDragHandle, typeof i5.CdkDragPreview, typeof i6.CdkDragPlaceholder], never, [typeof i1.CdkDropList, typeof i2.CdkDropListGroup, typeof i3.CdkDrag, typeof i4.CdkDragHandle, typeof i5.CdkDragPreview, typeof i6.CdkDragPlaceholder]>;
}

export declare class DragDropRegistry<I, C> implements OnDestroy {
    readonly pointerMove: Subject<TouchEvent | MouseEvent>;
    readonly pointerUp: Subject<TouchEvent | MouseEvent>;
    readonly scroll: Subject<Event>;
    constructor(_ngZone: NgZone, _document: any);
    isDragging(drag: I): boolean;
    ngOnDestroy(): void;
    registerDragItem(drag: I): void;
    registerDropContainer(drop: C): void;
    removeDragItem(drag: I): void;
    removeDropContainer(drop: C): void;
    startDragging(drag: I, event: TouchEvent | MouseEvent): void;
    stopDragging(drag: I): void;
    static ɵfac: i0.ɵɵFactoryDef<DragDropRegistry<any, any>>;
    static ɵprov: i0.ɵɵInjectableDef<DragDropRegistry<any, any>>;
}

export declare class DragRef<T = any> {
    beforeStarted: Subject<void>;
    constrainPosition?: (point: Point, dragRef: DragRef) => Point;
    data: T;
    get disabled(): boolean;
    set disabled(value: boolean);
    dragStartDelay: number | {
        touch: number;
        mouse: number;
    };
    dropped: Subject<{
        previousIndex: number;
        currentIndex: number;
        item: DragRef<any>;
        container: DropListRef;
        previousContainer: DropListRef;
        distance: Point;
        isPointerOverContainer: boolean;
    }>;
    ended: Subject<{
        source: DragRef<any>;
        distance: Point;
    }>;
    entered: Subject<{
        container: DropListRef;
        item: DragRef<any>;
        currentIndex: number;
    }>;
    exited: Subject<{
        container: DropListRef;
        item: DragRef<any>;
    }>;
    lockAxis: 'x' | 'y';
    moved: Observable<{
        source: DragRef;
        pointerPosition: {
            x: number;
            y: number;
        };
        event: MouseEvent | TouchEvent;
        distance: Point;
        delta: {
            x: -1 | 0 | 1;
            y: -1 | 0 | 1;
        };
    }>;
    previewClass: string | string[] | undefined;
    released: Subject<{
        source: DragRef<any>;
    }>;
    started: Subject<{
        source: DragRef<any>;
    }>;
    constructor(element: ElementRef<HTMLElement> | HTMLElement, _config: DragRefConfig, _document: Document, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>);
    _sortFromLastPointerPosition(): void;
    _withDropContainer(container: DropListRef): void;
    disableHandle(handle: HTMLElement): void;
    dispose(): void;
    enableHandle(handle: HTMLElement): void;
    getFreeDragPosition(): Readonly<Point>;
    getPlaceholderElement(): HTMLElement;
    getRootElement(): HTMLElement;
    isDragging(): boolean;
    reset(): void;
    setFreeDragPosition(value: Point): this;
    withBoundaryElement(boundaryElement: ElementRef<HTMLElement> | HTMLElement | null): this;
    withDirection(direction: Direction): this;
    withHandles(handles: (HTMLElement | ElementRef<HTMLElement>)[]): this;
    withPlaceholderTemplate(template: DragHelperTemplate | null): this;
    withPreviewTemplate(template: DragHelperTemplate | null): this;
    withRootElement(rootElement: ElementRef<HTMLElement> | HTMLElement): this;
}

export interface DragRefConfig {
    dragStartThreshold: number;
    pointerDirectionChangeThreshold: number;
}

export declare type DragStartDelay = number | {
    touch: number;
    mouse: number;
};

export declare type DropListOrientation = 'horizontal' | 'vertical';

export declare class DropListRef<T = any> {
    autoScrollDisabled: boolean;
    beforeStarted: Subject<void>;
    data: T;
    disabled: boolean;
    dropped: Subject<{
        item: DragRef;
        currentIndex: number;
        previousIndex: number;
        container: DropListRef<any>;
        previousContainer: DropListRef<any>;
        isPointerOverContainer: boolean;
        distance: Point;
    }>;
    element: HTMLElement | ElementRef<HTMLElement>;
    enterPredicate: (drag: DragRef, drop: DropListRef) => boolean;
    entered: Subject<{
        item: DragRef;
        container: DropListRef<any>;
        currentIndex: number;
    }>;
    exited: Subject<{
        item: DragRef;
        container: DropListRef<any>;
    }>;
    lockAxis: 'x' | 'y';
    sorted: Subject<{
        previousIndex: number;
        currentIndex: number;
        container: DropListRef<any>;
        item: DragRef;
    }>;
    sortingDisabled: boolean;
    constructor(element: ElementRef<HTMLElement> | HTMLElement, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, _document: any, _ngZone: NgZone, _viewportRuler: ViewportRuler);
    _canReceive(item: DragRef, x: number, y: number): boolean;
    _getSiblingContainerFromPosition(item: DragRef, x: number, y: number): DropListRef | undefined;
    _isOverContainer(x: number, y: number): boolean;
    _sortItem(item: DragRef, pointerX: number, pointerY: number, pointerDelta: {
        x: number;
        y: number;
    }): void;
    _startReceiving(sibling: DropListRef): void;
    _startScrollingIfNecessary(pointerX: number, pointerY: number): void;
    _stopReceiving(sibling: DropListRef): void;
    _stopScrolling(): void;
    connectedTo(connectedTo: DropListRef[]): this;
    dispose(): void;
    drop(item: DragRef, currentIndex: number, previousContainer: DropListRef, isPointerOverContainer: boolean, distance: Point): void;
    enter(item: DragRef, pointerX: number, pointerY: number): void;
    exit(item: DragRef): void;
    getItemIndex(item: DragRef): number;
    isDragging(): boolean;
    isReceiving(): boolean;
    start(): void;
    withDirection(direction: Direction): this;
    withItems(items: DragRef[]): this;
    withOrientation(orientation: 'vertical' | 'horizontal'): this;
    withScrollableParents(elements: HTMLElement[]): this;
}

export declare function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void;

export declare function transferArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;
