/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {HeaderRowOutlet, DataRowOutlet, CdkTable, FooterRowOutlet} from './table';
import {
  CdkCellOutlet, CdkFooterRow, CdkFooterRowDef, CdkHeaderRow, CdkHeaderRowDef, CdkRow,
  CdkRowDef
} from './row';
import {
  CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCell, CdkCellDef,
  CdkFooterCellDef, CdkFooterCell
} from './cell';
import {CdkTextColumn} from './text-column';

const EXPORTED_DECLARATIONS = [
  CdkTable,
  CdkRowDef,
  CdkCellDef,
  CdkCellOutlet,
  CdkHeaderCellDef,
  CdkFooterCellDef,
  CdkColumnDef,
  CdkCell,
  CdkRow,
  CdkHeaderCell,
  CdkFooterCell,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkFooterRow,
  CdkFooterRowDef,
  DataRowOutlet,
  HeaderRowOutlet,
  FooterRowOutlet,
  CdkTextColumn,
];

@NgModule({
  exports: EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS

})
export class CdkTableModule { }
