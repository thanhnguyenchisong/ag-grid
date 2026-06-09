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
      :host ::ng-deep .ag-grid-common-cell--warning {
        background-color: #fef9c3 !important;
      }
      :host ::ng-deep .ag-grid-common-cell__wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.35rem;
      }
      :host ::ng-deep .ag-grid-common-cell__value {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      :host ::ng-deep .ag-grid-common-cell__badge {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.125rem;
        height: 1.125rem;
        border-radius: 50%;
        background: #facc15;
        color: #854d0e;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
        cursor: help;
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
  /** Set false when the grid service is shared (e.g. `providedIn: 'root'`). */
  @Input() autoDestroy = true;

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
    if (this.autoDestroy) {
      this.grid?.destroy();
    }
  }
}
