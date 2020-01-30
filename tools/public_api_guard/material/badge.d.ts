export declare class MatBadge extends _MatBadgeMixinBase implements OnDestroy, OnChanges, CanDisable {
    _hasContent: boolean;
    _id: number;
    get color(): ThemePalette;
    set color(value: ThemePalette);
    content: string;
    get description(): string;
    set description(newDescription: string);
    get hidden(): boolean;
    set hidden(val: boolean);
    get overlap(): boolean;
    set overlap(val: boolean);
    position: MatBadgePosition;
    size: MatBadgeSize;
    constructor(_ngZone: NgZone, _elementRef: ElementRef<HTMLElement>, _ariaDescriber: AriaDescriber, _renderer: Renderer2, _animationMode?: string | undefined);
    getBadgeElement(): HTMLElement | undefined;
    isAbove(): boolean;
    isAfter(): boolean;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_hidden: BooleanInput;
    static ngAcceptInputType_overlap: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatBadge, "[matBadge]", never, { "disabled": "matBadgeDisabled"; "color": "matBadgeColor"; "overlap": "matBadgeOverlap"; "position": "matBadgePosition"; "content": "matBadge"; "description": "matBadgeDescription"; "size": "matBadgeSize"; "hidden": "matBadgeHidden"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatBadge>;
}

export declare class MatBadgeModule {
    static ɵinj: i0.ɵɵInjectorDef<MatBadgeModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatBadgeModule, [typeof i1.MatBadge], [typeof i2.A11yModule, typeof i3.MatCommonModule], [typeof i1.MatBadge]>;
}

export declare type MatBadgePosition = 'above after' | 'above before' | 'below before' | 'below after' | 'before' | 'after' | 'above' | 'below';

export declare type MatBadgeSize = 'small' | 'medium' | 'large';
