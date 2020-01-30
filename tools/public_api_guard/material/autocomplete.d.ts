export declare const AUTOCOMPLETE_OPTION_HEIGHT = 48;

export declare const AUTOCOMPLETE_PANEL_HEIGHT = 256;

export declare function getMatAutocompleteMissingPanelError(): Error;

export declare const MAT_AUTOCOMPLETE_DEFAULT_OPTIONS: InjectionToken<MatAutocompleteDefaultOptions>;

export declare function MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): MatAutocompleteDefaultOptions;

export declare const MAT_AUTOCOMPLETE_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY;
};

export declare const MAT_AUTOCOMPLETE_VALUE_ACCESSOR: any;

export declare class MatAutocomplete extends _MatAutocompleteMixinBase implements AfterContentInit, CanDisableRipple {
    _classList: {
        [key: string]: boolean;
    };
    _isOpen: boolean;
    _keyManager: ActiveDescendantKeyManager<MatOption>;
    get autoActiveFirstOption(): boolean;
    set autoActiveFirstOption(value: boolean);
    set classList(value: string);
    readonly closed: EventEmitter<void>;
    displayWith: ((value: any) => string) | null;
    id: string;
    get isOpen(): boolean;
    readonly opened: EventEmitter<void>;
    optionGroups: QueryList<MatOptgroup>;
    readonly optionSelected: EventEmitter<MatAutocompleteSelectedEvent>;
    options: QueryList<MatOption>;
    panel: ElementRef;
    panelWidth: string | number;
    showPanel: boolean;
    template: TemplateRef<any>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, defaults: MatAutocompleteDefaultOptions);
    _emitSelectEvent(option: MatOption): void;
    _getScrollTop(): number;
    _setScrollTop(scrollTop: number): void;
    _setVisibility(): void;
    ngAfterContentInit(): void;
    static ngAcceptInputType_autoActiveFirstOption: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatAutocomplete, "mat-autocomplete", ["matAutocomplete"], { "disableRipple": "disableRipple"; "displayWith": "displayWith"; "autoActiveFirstOption": "autoActiveFirstOption"; "panelWidth": "panelWidth"; "classList": "class"; }, { "optionSelected": "optionSelected"; "opened": "opened"; "closed": "closed"; }, ["options", "optionGroups"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatAutocomplete>;
}

export interface MatAutocompleteDefaultOptions {
    autoActiveFirstOption?: boolean;
}

export declare class MatAutocompleteModule {
    static ɵinj: i0.ɵɵInjectorDef<MatAutocompleteModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatAutocompleteModule, [typeof i1.MatAutocomplete, typeof i2.MatAutocompleteTrigger, typeof i3.MatAutocompleteOrigin], [typeof i4.MatOptionModule, typeof i5.OverlayModule, typeof i4.MatCommonModule, typeof i6.CommonModule], [typeof i1.MatAutocomplete, typeof i4.MatOptionModule, typeof i2.MatAutocompleteTrigger, typeof i3.MatAutocompleteOrigin, typeof i4.MatCommonModule]>;
}

export declare class MatAutocompleteOrigin {
    elementRef: ElementRef<HTMLElement>;
    constructor(
    elementRef: ElementRef<HTMLElement>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatAutocompleteOrigin, "[matAutocompleteOrigin]", ["matAutocompleteOrigin"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatAutocompleteOrigin>;
}

export declare class MatAutocompleteSelectedEvent {
    option: MatOption;
    source: MatAutocomplete;
    constructor(
    source: MatAutocomplete,
    option: MatOption);
}

export declare class MatAutocompleteTrigger implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy {
    _onChange: (value: any) => void;
    _onTouched: () => void;
    get activeOption(): MatOption | null;
    autocomplete: MatAutocomplete;
    autocompleteAttribute: string;
    get autocompleteDisabled(): boolean;
    set autocompleteDisabled(value: boolean);
    connectedTo: MatAutocompleteOrigin;
    readonly optionSelections: Observable<MatOptionSelectionChange>;
    get panelClosingActions(): Observable<MatOptionSelectionChange | null>;
    get panelOpen(): boolean;
    position: 'auto' | 'above' | 'below';
    constructor(_element: ElementRef<HTMLInputElement>, _overlay: Overlay, _viewContainerRef: ViewContainerRef, _zone: NgZone, _changeDetectorRef: ChangeDetectorRef, scrollStrategy: any, _dir: Directionality, _formField: MatFormField, _document: any, _viewportRuler?: ViewportRuler | undefined);
    _handleFocus(): void;
    _handleInput(event: KeyboardEvent): void;
    _handleKeydown(event: KeyboardEvent): void;
    closePanel(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    openPanel(): void;
    registerOnChange(fn: (value: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    updatePosition(): void;
    writeValue(value: any): void;
    static ngAcceptInputType_autocompleteDisabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatAutocompleteTrigger, "input[matAutocomplete], textarea[matAutocomplete]", ["matAutocompleteTrigger"], { "autocomplete": "matAutocomplete"; "position": "matAutocompletePosition"; "connectedTo": "matAutocompleteConnectedTo"; "autocompleteAttribute": "autocomplete"; "autocompleteDisabled": "matAutocompleteDisabled"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatAutocompleteTrigger>;
}
