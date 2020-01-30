/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkEditable, CdkPopoverEditModule} from '@angular/cdk-experimental/popover-edit';
import {
  MatPopoverEdit,
  MatPopoverEditTabOut,
  MatRowHoverContent,
  MatEditOpen
} from './table-directives';
import {
  MatEditLens,
  MatEditRevert,
  MatEditClose
} from './lens-directives';

const EXPORTED_DECLARATIONS = [
  MatPopoverEdit,
  MatPopoverEditTabOut,
  MatRowHoverContent,
  MatEditLens,
  MatEditRevert,
  MatEditClose,
  MatEditOpen
];

@NgModule({
  imports: [
    CdkPopoverEditModule,
  ],
  exports: [
    ...EXPORTED_DECLARATIONS,
    CdkEditable,
  ],
  declarations: EXPORTED_DECLARATIONS,
})
export class MatPopoverEditModule { }
