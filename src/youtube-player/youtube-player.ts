/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="youtube" />

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
  Optional,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

import {
  combineLatest,
  ConnectableObservable,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of as observableOf,
  OperatorFunction,
  pipe,
  Subject,
  of,
  BehaviorSubject,
} from 'rxjs';

import {
  combineLatest as combineLatestOp,
  distinctUntilChanged,
  filter,
  flatMap,
  map,
  publish,
  scan,
  skipWhile,
  startWith,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const DEFAULT_PLAYER_WIDTH = 640;
export const DEFAULT_PLAYER_HEIGHT = 390;

// The native YT.Player doesn't expose the set videoId, but we need it for
// convenience.
interface Player extends YT.Player {
  videoId?: string | undefined;
}

// The player isn't fully initialized when it's constructed.
// The only field available is destroy and addEventListener.
type UninitializedPlayer = Pick<Player, 'videoId' | 'destroy' | 'addEventListener'>;

/**
 * Object used to store the state of the player if the
 * user tries to interact with the API before it has been loaded.
 */
interface PendingPlayerState {
  playbackState?: YT.PlayerState.PLAYING | YT.PlayerState.PAUSED | YT.PlayerState.CUED;
  playbackRate?: number;
  volume?: number;
  muted?: boolean;
  seek?: {seconds: number, allowSeekAhead: boolean};
}

/**
 * Angular component that renders a YouTube player via the YouTube player
 * iframe API.
 * @see https://developers.google.com/youtube/iframe_api_reference
 */
@Component({
  selector: 'youtube-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // This div is *replaced* by the YouTube player embed.
  template: '<div #youtubeContainer></div>',
})
export class YouTubePlayer implements AfterViewInit, OnDestroy, OnInit {
  /** YouTube Video ID to view */
  @Input()
  get videoId(): string | undefined { return this._videoId.value; }
  set videoId(videoId: string | undefined) {
    this._videoId.next(videoId);
  }
  private _videoId = new BehaviorSubject<string | undefined>(undefined);

  /** Height of video player */
  @Input()
  get height(): number | undefined { return this._height.value; }
  set height(height: number | undefined) {
    this._height.next(height || DEFAULT_PLAYER_HEIGHT);
  }
  private _height = new BehaviorSubject<number>(DEFAULT_PLAYER_HEIGHT);

  /** Width of video player */
  @Input()
  get width(): number | undefined { return this._width.value; }
  set width(width: number | undefined) {
    this._width.next(width || DEFAULT_PLAYER_WIDTH);
  }
  private _width = new BehaviorSubject<number>(DEFAULT_PLAYER_WIDTH);

  /** The moment when the player is supposed to start playing */
  @Input()
  set startSeconds(startSeconds: number | undefined) {
    this._startSeconds.next(startSeconds);
  }
  private _startSeconds = new BehaviorSubject<number | undefined>(undefined);

  /** The moment when the player is supposed to stop playing */
  @Input()
  set endSeconds(endSeconds: number | undefined) {
    this._endSeconds.next(endSeconds);
  }
  private _endSeconds = new BehaviorSubject<number | undefined>(undefined);

  /** The suggested quality of the player */
  @Input()
  set suggestedQuality(suggestedQuality: YT.SuggestedVideoQuality | undefined) {
    this._suggestedQuality.next(suggestedQuality);
  }
  private _suggestedQuality = new BehaviorSubject<YT.SuggestedVideoQuality | undefined>(undefined);

  /**
   * Whether the iframe will attempt to load regardless of the status of the api on the
   * page. Set this to true if you don't want the `onYouTubeIframeAPIReady` field to be
   * set on the global window.
   */
  @Input() showBeforeIframeApiLoads: boolean | undefined;

  /** Outputs are direct proxies from the player itself. */
  @Output() ready = new EventEmitter<YT.PlayerEvent>();
  @Output() stateChange = new EventEmitter<YT.OnStateChangeEvent>();
  @Output() error = new EventEmitter<YT.OnErrorEvent>();
  @Output() apiChange = new EventEmitter<YT.PlayerEvent>();
  @Output() playbackQualityChange = new EventEmitter<YT.OnPlaybackQualityChangeEvent>();
  @Output() playbackRateChange = new EventEmitter<YT.OnPlaybackRateChangeEvent>();

  /** The element that will be replaced by the iframe. */
  @ViewChild('youtubeContainer')
  youtubeContainer: ElementRef<HTMLElement>;

  /** Whether we're currently rendering inside a browser. */
  private _isBrowser: boolean;
  private _youtubeContainer = new Subject<HTMLElement>();
  private _destroyed = new Subject<void>();
  private _player: Player | undefined;
  private _existingApiReadyCallback: (() => void) | undefined;
  private _pendingPlayerState: PendingPlayerState | undefined;

  constructor(
    private _ngZone: NgZone,
    /**
     * @deprecated `platformId` parameter to become required.
     * @breaking-change 10.0.0
     */
    @Optional() @Inject(PLATFORM_ID) platformId?: Object) {

    // @breaking-change 10.0.0 Remove null check for `platformId`.
    this._isBrowser =
        platformId ? isPlatformBrowser(platformId) : typeof window === 'object' && !!window;
  }

  ngOnInit() {
    // Don't do anything if we're not in a browser environment.
    if (!this._isBrowser) {
      return;
    }

    let iframeApiAvailableObs: Observable<boolean> = observableOf(true);
    if (!window.YT) {
      if (this.showBeforeIframeApiLoads) {
        throw new Error('Namespace YT not found, cannot construct embedded youtube player. ' +
            'Please install the YouTube Player API Reference for iframe Embeds: ' +
            'https://developers.google.com/youtube/iframe_api_reference');
      }

      const iframeApiAvailableSubject = new Subject<boolean>();
      this._existingApiReadyCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (this._existingApiReadyCallback) {
          this._existingApiReadyCallback();
        }
        this._ngZone.run(() => iframeApiAvailableSubject.next(true));
      };
      iframeApiAvailableObs = iframeApiAvailableSubject.pipe(take(1), startWith(false));
    }

    // An observable of the currently loaded player.
    const playerObs =
      createPlayerObservable(
        this._youtubeContainer,
        this._videoId,
        iframeApiAvailableObs,
        this._width,
        this._height,
        this.createEventsBoundInZone(),
        this._ngZone
      ).pipe(waitUntilReady(player => {
        // Destroy the player if loading was aborted so that we don't end up leaking memory.
        if (!playerIsReady(player)) {
          player.destroy();
        }
      }), takeUntil(this._destroyed), publish());

    // Set up side effects to bind inputs to the player.
    playerObs.subscribe(player => {
      this._player = player;

      if (player && this._pendingPlayerState) {
        this._initializePlayer(player, this._pendingPlayerState);
      }

      this._pendingPlayerState = undefined;
    });

    bindSizeToPlayer(playerObs, this._width, this._height);

    bindSuggestedQualityToPlayer(playerObs, this._suggestedQuality);

    bindCueVideoCall(
      playerObs,
      this._videoId,
      this._startSeconds,
      this._endSeconds,
      this._suggestedQuality,
      this._destroyed);

    // After all of the subscriptions are set up, connect the observable.
    (playerObs as ConnectableObservable<Player>).connect();
  }

  createEventsBoundInZone(): YT.Events {
    const output: YT.Events = {};
    const events = new Map<keyof YT.Events, EventEmitter<any>>([
      ['onReady', this.ready],
      ['onStateChange', this.stateChange],
      ['onPlaybackQualityChange', this.playbackQualityChange],
      ['onPlaybackRateChange', this.playbackRateChange],
      ['onError', this.error],
      ['onApiChange', this.apiChange]
    ]);

    events.forEach((emitter, name) => {
      // Since these events all trigger change detection, only bind them if something is subscribed.
      if (emitter.observers.length) {
        output[name] = this._runInZone(event => emitter.emit(event));
      }
    });

    return output;
  }

  ngAfterViewInit() {
    this._youtubeContainer.next(this.youtubeContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this._player) {
      this._player.destroy();
      window.onYouTubeIframeAPIReady = this._existingApiReadyCallback;
    }

    this._videoId.complete();
    this._height.complete();
    this._width.complete();
    this._startSeconds.complete();
    this._endSeconds.complete();
    this._suggestedQuality.complete();
    this._youtubeContainer.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _runInZone<T extends (...args: any[]) => void>(callback: T):
      (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => this._ngZone.run(() => callback(...args));
  }

  /** Proxied methods. */

  /** See https://developers.google.com/youtube/iframe_api_reference#playVideo */
  playVideo() {
    if (this._player) {
      this._player.playVideo();
    } else {
      this._getPendingState().playbackState = YT.PlayerState.PLAYING;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#pauseVideo */
  pauseVideo() {
    if (this._player) {
      this._player.pauseVideo();
    } else {
      this._getPendingState().playbackState = YT.PlayerState.PAUSED;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#stopVideo */
  stopVideo() {
    if (this._player) {
      this._player.stopVideo();
    } else {
      // It seems like YouTube sets the player to CUED when it's stopped.
      this._getPendingState().playbackState = YT.PlayerState.CUED;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#seekTo */
  seekTo(seconds: number, allowSeekAhead: boolean) {
    if (this._player) {
      this._player.seekTo(seconds, allowSeekAhead);
    } else {
      this._getPendingState().seek = {seconds, allowSeekAhead};
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#mute */
  mute() {
    if (this._player) {
      this._player.mute();
    } else {
      this._getPendingState().muted = true;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#unMute */
  unMute() {
    if (this._player) {
      this._player.unMute();
    } else {
      this._getPendingState().muted = false;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#isMuted */
  isMuted(): boolean {
    if (this._player) {
      return this._player.isMuted();
    }

    if (this._pendingPlayerState) {
      return !!this._pendingPlayerState.muted;
    }

    return false;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setVolume */
  setVolume(volume: number) {
    if (this._player) {
      this._player.setVolume(volume);
    } else {
      this._getPendingState().volume = volume;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVolume */
  getVolume(): number {
    if (this._player) {
      return this._player.getVolume();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.volume != null) {
      return this._pendingPlayerState.volume;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setPlaybackRate */
  setPlaybackRate(playbackRate: number) {
    if (this._player) {
      return this._player.setPlaybackRate(playbackRate);
    } else {
      this._getPendingState().playbackRate = playbackRate;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackRate */
  getPlaybackRate(): number {
    if (this._player) {
      return this._player.getPlaybackRate();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.playbackRate != null) {
      return this._pendingPlayerState.playbackRate;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailablePlaybackRates */
  getAvailablePlaybackRates(): number[] {
    return this._player ? this._player.getAvailablePlaybackRates() : [];
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoLoadedFraction */
  getVideoLoadedFraction(): number {
    return this._player ? this._player.getVideoLoadedFraction() : 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlayerState */
  getPlayerState(): YT.PlayerState | undefined {
    if (!this._isBrowser || !window.YT) {
      return undefined;
    }

    if (this._player) {
      return this._player.getPlayerState();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.playbackState != null) {
      return this._pendingPlayerState.playbackState;
    }

    return YT.PlayerState.UNSTARTED;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getCurrentTime */
  getCurrentTime(): number {
    if (this._player) {
      return this._player.getCurrentTime();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.seek) {
      return this._pendingPlayerState.seek.seconds;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackQuality */
  getPlaybackQuality(): YT.SuggestedVideoQuality {
    return this._player ? this._player.getPlaybackQuality() : 'default';
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailableQualityLevels */
  getAvailableQualityLevels(): YT.SuggestedVideoQuality[] {
    return this._player ? this._player.getAvailableQualityLevels() : [];
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getDuration */
  getDuration(): number {
    return this._player ? this._player.getDuration() : 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoUrl */
  getVideoUrl(): string {
    return this._player ? this._player.getVideoUrl() : '';
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoEmbedCode */
  getVideoEmbedCode(): string {
    return this._player ? this._player.getVideoEmbedCode() : '';
  }

  /** Gets an object that should be used to store the temporary API state. */
  private _getPendingState(): PendingPlayerState {
    if (!this._pendingPlayerState) {
      this._pendingPlayerState = {};
    }

    return this._pendingPlayerState;
  }

  /** Initializes a player from a temporary state. */
  private _initializePlayer(player: YT.Player, state: PendingPlayerState): void {
    const {playbackState, playbackRate, volume, muted, seek} = state;

    switch (playbackState) {
      case YT.PlayerState.PLAYING: player.playVideo(); break;
      case YT.PlayerState.PAUSED: player.pauseVideo(); break;
      case YT.PlayerState.CUED: player.stopVideo(); break;
    }

    if (playbackRate != null) {
      player.setPlaybackRate(playbackRate);
    }

    if (volume != null) {
      player.setVolume(volume);
    }

    if (muted != null) {
      muted ? player.mute() : player.unMute();
    }

    if (seek != null) {
      player.seekTo(seek.seconds, seek.allowSeekAhead);
    }
  }
}

/** Listens to changes to the given width and height and sets it on the player. */
function bindSizeToPlayer(
  playerObs: Observable<YT.Player | undefined>,
  widthObs: Observable<number>,
  heightObs: Observable<number>
) {
  return combineLatest([playerObs, widthObs, heightObs])
      .subscribe(([player, width, height]) => player && player.setSize(width, height));
}

/** Listens to changes from the suggested quality and sets it on the given player. */
function bindSuggestedQualityToPlayer(
  playerObs: Observable<YT.Player | undefined>,
  suggestedQualityObs: Observable<YT.SuggestedVideoQuality | undefined>
) {
  return combineLatest([
    playerObs,
    suggestedQualityObs
  ]).subscribe(
    ([player, suggestedQuality]) =>
        player && suggestedQuality && player.setPlaybackQuality(suggestedQuality));
}

/**
 * Returns an observable that emits the loaded player once it's ready. Certain properties/methods
 * won't be available until the iframe finishes loading.
 * @param onAbort Callback function that will be invoked if the player loading was aborted before
 * it was able to complete. Can be used to clean up any loose references.
 */
function waitUntilReady(onAbort: (player: UninitializedPlayer) => void):
  OperatorFunction<UninitializedPlayer | undefined, Player | undefined> {
  return flatMap(player => {
    if (!player) {
      return observableOf<Player|undefined>(undefined);
    }
    if (playerIsReady(player)) {
      return observableOf(player as Player);
    }

    // Since removeEventListener is not on Player when it's initialized, we can't use fromEvent.
    // The player is not initialized fully until the ready is called.
    return new Observable<Player>(emitter => {
      let aborted = false;
      let resolved = false;
      const onReady = (event: YT.PlayerEvent) => {
        resolved = true;

        if (!aborted) {
          event.target.removeEventListener('onReady', onReady);
          emitter.next(event.target);
        }
      };

      player.addEventListener('onReady', onReady);

      return () => {
        aborted = true;

        if (!resolved) {
          onAbort(player);
        }
      };
    }).pipe(take(1), startWith(undefined));
  });
}

/** Create an observable for the player based on the given options. */
function createPlayerObservable(
  youtubeContainer: Observable<HTMLElement>,
  videoIdObs: Observable<string | undefined>,
  iframeApiAvailableObs: Observable<boolean>,
  widthObs: Observable<number>,
  heightObs: Observable<number>,
  events: YT.Events,
  ngZone: NgZone
): Observable<UninitializedPlayer | undefined> {

  const playerOptions =
    videoIdObs
    .pipe(
      withLatestFrom(combineLatest([widthObs, heightObs])),
      map(([videoId, [width, height]]) => videoId ? ({videoId, width, height, events}) : undefined),
    );

  return combineLatest([youtubeContainer, playerOptions, of(ngZone)])
      .pipe(
        skipUntilRememberLatest(iframeApiAvailableObs),
        scan(syncPlayerState, undefined),
        distinctUntilChanged());
}

/** Skips the given observable until the other observable emits true, then emit the latest. */
function skipUntilRememberLatest<T>(notifier: Observable<boolean>): MonoTypeOperatorFunction<T> {
  return pipe(
    combineLatestOp(notifier),
    skipWhile(([_, doneSkipping]) => !doneSkipping),
    map(([value]) => value));
}

/** Destroy the player if there are no options, or create the player if there are options. */
function syncPlayerState(
  player: UninitializedPlayer | undefined,
  [container, videoOptions, ngZone]: [HTMLElement, YT.PlayerOptions | undefined, NgZone],
): UninitializedPlayer | undefined {
  if (!videoOptions) {
    if (player) {
      player.destroy();
    }
    return;
  }
  if (player) {
    return player;
  }

  // Important! We need to create the Player object outside of the `NgZone`, because it kicks
  // off a 250ms setInterval which will continually trigger change detection if we don't.
  const newPlayer: UninitializedPlayer =
      ngZone.runOutsideAngular(() => new YT.Player(container, videoOptions));
  // Bind videoId for future use.
  newPlayer.videoId = videoOptions.videoId;
  return newPlayer;
}

/**
 * Call cueVideoById if the videoId changes, or when start or end seconds change. cueVideoById will
 * change the loaded video id to the given videoId, and set the start and end times to the given
 * start/end seconds.
 */
function bindCueVideoCall(
  playerObs: Observable<Player | undefined>,
  videoIdObs: Observable<string | undefined>,
  startSecondsObs: Observable<number | undefined>,
  endSecondsObs: Observable<number | undefined>,
  suggestedQualityObs: Observable<YT.SuggestedVideoQuality | undefined>,
  destroyed: Observable<void>,
) {
  const cueOptionsObs = combineLatest([startSecondsObs, endSecondsObs])
    .pipe(map(([startSeconds, endSeconds]) => ({startSeconds, endSeconds})));

  // Only respond to changes in cue options if the player is not running.
  const filteredCueOptions = cueOptionsObs
    .pipe(filterOnOther(playerObs, player => !!player && !hasPlayerStarted(player)));

  // If the video id changed, there's no reason to run 'cue' unless the player
  // was initialized with a different video id.
  const changedVideoId = videoIdObs
      .pipe(filterOnOther(playerObs, (player, videoId) => !!player && player.videoId !== videoId));

  // If the player changed, there's no reason to run 'cue' unless there are cue options.
  const changedPlayer = playerObs.pipe(
    filterOnOther(
      combineLatest([videoIdObs, cueOptionsObs]),
      ([videoId, cueOptions], player) =>
          !!player &&
            (videoId != player.videoId || !!cueOptions.startSeconds || !!cueOptions.endSeconds)));

  merge(changedPlayer, changedVideoId, filteredCueOptions)
    .pipe(
      withLatestFrom(combineLatest([playerObs, videoIdObs, cueOptionsObs, suggestedQualityObs])),
      map(([_, values]) => values),
      takeUntil(destroyed),
    )
    .subscribe(([player, videoId, cueOptions, suggestedQuality]) => {
      if (!videoId || !player) {
        return;
      }
      player.videoId = videoId;
      player.cueVideoById({
        videoId,
        suggestedQuality,
        ...cueOptions,
      });
    });
}

function hasPlayerStarted(player: YT.Player): boolean {
  const state = player.getPlayerState();
  return state !== YT.PlayerState.UNSTARTED && state !== YT.PlayerState.CUED;
}

function playerIsReady(player: UninitializedPlayer): player is Player {
  return 'getPlayerStatus' in player;
}

/** Combines the two observables temporarily for the filter function. */
function filterOnOther<R, T>(
  otherObs: Observable<T>,
  filterFn: (t: T, r?: R) => boolean,
): MonoTypeOperatorFunction<R> {
  return pipe(
    withLatestFrom(otherObs),
    filter(([value, other]) => filterFn(other, value)),
    map(([value]) => value),
  );
}
