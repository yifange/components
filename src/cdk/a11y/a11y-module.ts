/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {PlatformModule} from '@angular/cdk/platform';
import {NgModule} from '@angular/core';
import {CdkMonitorFocus} from './focus-monitor/focus-monitor';
import {CdkTrapFocus} from './focus-trap/focus-trap';
import {HighContrastModeDetector} from './high-contrast-mode/high-contrast-mode-detector';
import {CdkAriaLive} from './live-announcer/live-announcer';


@NgModule({
  imports: [PlatformModule, ObserversModule],
  declarations: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
  exports: [CdkAriaLive, CdkTrapFocus, CdkMonitorFocus],
})
export class A11yModule {
  constructor(highContrastModeDetector: HighContrastModeDetector) {
    highContrastModeDetector._applyBodyHighContrastModeCssClasses();
  }
}
