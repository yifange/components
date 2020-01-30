export declare const MAT_SNACK_BAR_DATA: InjectionToken<any>;

export declare const MAT_SNACK_BAR_DEFAULT_OPTIONS: InjectionToken<MatSnackBarConfig<any>>;

export declare function MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY(): MatSnackBarConfig;

export declare class MatSnackBar implements OnDestroy {
    get _openedSnackBarRef(): MatSnackBarRef<any> | null;
    set _openedSnackBarRef(value: MatSnackBarRef<any> | null);
    constructor(_overlay: Overlay, _live: LiveAnnouncer, _injector: Injector, _breakpointObserver: BreakpointObserver, _parentSnackBar: MatSnackBar, _defaultConfig: MatSnackBarConfig);
    dismiss(): void;
    ngOnDestroy(): void;
    open(message: string, action?: string, config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar>;
    openFromComponent<T>(component: ComponentType<T>, config?: MatSnackBarConfig): MatSnackBarRef<T>;
    openFromTemplate(template: TemplateRef<any>, config?: MatSnackBarConfig): MatSnackBarRef<EmbeddedViewRef<any>>;
    static ɵfac: i0.ɵɵFactoryDef<MatSnackBar>;
    static ɵprov: i0.ɵɵInjectableDef<MatSnackBar>;
}

export declare const matSnackBarAnimations: {
    readonly snackBarState: AnimationTriggerMetadata;
};

export declare class MatSnackBarConfig<D = any> {
    announcementMessage?: string;
    data?: D | null;
    direction?: Direction;
    duration?: number;
    horizontalPosition?: MatSnackBarHorizontalPosition;
    panelClass?: string | string[];
    politeness?: AriaLivePoliteness;
    verticalPosition?: MatSnackBarVerticalPosition;
    viewContainerRef?: ViewContainerRef;
}

export declare class MatSnackBarContainer extends BasePortalOutlet implements OnDestroy {
    _animationState: string;
    readonly _onEnter: Subject<any>;
    readonly _onExit: Subject<any>;
    _portalOutlet: CdkPortalOutlet;
    _role: 'alert' | 'status' | null;
    attachDomPortal: (portal: DomPortal<HTMLElement>) => void;
    snackBarConfig: MatSnackBarConfig;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef,
    snackBarConfig: MatSnackBarConfig);
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    enter(): void;
    exit(): Observable<void>;
    ngOnDestroy(): void;
    onAnimationEnd(event: AnimationEvent): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatSnackBarContainer, "snack-bar-container", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatSnackBarContainer>;
}

export interface MatSnackBarDismiss {
    dismissedByAction: boolean;
}

export declare type MatSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';

export declare class MatSnackBarModule {
    static ɵinj: i0.ɵɵInjectorDef<MatSnackBarModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatSnackBarModule, [typeof i1.MatSnackBarContainer, typeof i2.SimpleSnackBar], [typeof i3.OverlayModule, typeof i4.PortalModule, typeof i5.CommonModule, typeof i6.MatButtonModule, typeof i7.MatCommonModule], [typeof i1.MatSnackBarContainer, typeof i7.MatCommonModule]>;
}

export declare class MatSnackBarRef<T> {
    containerInstance: MatSnackBarContainer;
    instance: T;
    constructor(containerInstance: MatSnackBarContainer, _overlayRef: OverlayRef);
    _dismissAfter(duration: number): void;
    _open(): void;
    afterDismissed(): Observable<MatSnackBarDismiss>;
    afterOpened(): Observable<void>;
    closeWithAction(): void;
    dismiss(): void;
    dismissWithAction(): void;
    onAction(): Observable<void>;
}

export declare type MatSnackBarVerticalPosition = 'top' | 'bottom';

export declare class SimpleSnackBar {
    data: {
        message: string;
        action: string;
    };
    get hasAction(): boolean;
    snackBarRef: MatSnackBarRef<SimpleSnackBar>;
    constructor(snackBarRef: MatSnackBarRef<SimpleSnackBar>, data: any);
    action(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleSnackBar, "simple-snack-bar", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<SimpleSnackBar>;
}
