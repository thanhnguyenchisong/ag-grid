import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  isDevMode,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { GridOptions } from 'ag-grid-community';
import type { AgGridTableHost } from '../models/ag-grid.types';

/**
 * Reusable table shell — pass any {@link AgGridBase} subclass from a feature service.
 *
 * @example
 * ```html
 * <app-ag-grid-table [grid]="ordersGrid" height="500px" />
 * ```
 */
@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <div [class]="themeClass" [style.height]="height" [style.width]="width">
      <ag-grid-angular
        class="app-ag-grid-table__grid"
        [gridOptions]="gridOptions"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .app-ag-grid-table__grid {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgGridTableComponent implements OnInit, OnDestroy {
  /** Feature grid service (extends AgGridBase). */
  @Input({ required: true }) grid!: AgGridTableHost;

  @Input() height?: string;
  @Input() width = '100%';

  gridOptions!: GridOptions;
  themeClass = 'ag-theme-quartz';

  ngOnInit(): void {
    if (!this.grid && isDevMode()) {
      throw new Error('app-ag-grid-table: [grid] input is required');
    }
    this.gridOptions = this.grid.getTableGridOptions();
    this.themeClass = this.grid.themeClass;
    if (!this.height) {
      this.height = this.grid.defaultHeight;
    }
  }

  ngOnDestroy(): void {
    this.grid?.destroy();
  }
}
