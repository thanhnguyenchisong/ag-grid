/**
 * COMPLEX SERVER-DRIVEN TABLE — same schema/groups/pipelines as client example,
 * but data loads via Infinite Row Model + HTTP blocks.
 *
 * Setup:
 * 1. Backend: GET /api/products?offset&limit&sort&filter → { items, total }
 * 2. Inject ProductsApi (see demo products-api.service.ts)
 * 3. override createInfiniteDatasource() — do NOT call setRowData()
 *
 * Server notes:
 * - Sort/filter apply to **field** columns on the API (unitPriceCents, sku, …).
 * - Computed columns (colId only) are client-rendered from each loaded row.
 * - After inline edit, refresh dependent computed cols on the row node only.
 *
 * SSRM variant: copy orders-ssrm-grid.service.example.ts + same buildColumnDefs().
 */
import { Injectable } from '@angular/core';
import type {
  CellValueChangedEvent,
  ColDef,
  GridOptions,
  IDatasource,
} from 'ag-grid-community';
import { AgGridBase } from '../core/ag-grid-base';
import { ColumnSchemaBuilder } from '../columns/column-schema-builder';
import { PRODUCT_COLUMN_GROUPS } from './product-columns.schema.example';
import {
  PRODUCT_DEPENDENT_COLUMNS,
  PRODUCT_PIPELINES,
} from './product-pipelines.example';
import type { ProductRow } from './product-row.model.example';

/** Map grid request → your API (demo: products-api.service.ts). */
export interface ProductsPageRequest {
  startRow: number;
  endRow: number;
  sortModel: { colId: string; sort: 'asc' | 'desc' | null }[];
  filterModel: unknown;
}

export interface ProductsApiLike {
  getPage(req: ProductsPageRequest): {
    subscribe(handlers: {
      next: (res: { items: ProductRow[]; total: number }) => void;
      error: () => void;
    }): void;
  };
}

// @Injectable()
export class ComplexProductServerGridService extends AgGridBase<ProductRow> {
  private readonly schemaBuilder = new ColumnSchemaBuilder<ProductRow>(this.columns);

  constructor(
    private readonly productsApi: ProductsApiLike,
  ) {
    super({
      id: 'products-server-grid',
      serverSideCacheBlockSize: 50,
      gridOptions: {
        cacheBlockSize: 50,
        maxBlocksInCache: 10,
        infiniteInitialRowCount: 50,
        maxConcurrentDatasourceRequests: 1,
      },
    });
  }

  protected override getDefaultGridOptions(): GridOptions<ProductRow> {
    return {
      ...super.getDefaultGridOptions(),
      getRowId: (p) => p.data.id,
      rowSelection: { mode: 'multiRow', checkboxes: true, headerCheckbox: true },
      onCellValueChanged: (e) => this.onCellPersist(e),
    };
  }

  protected override createInfiniteDatasource(): IDatasource {
    return {
      getRows: (params) => {
        this.productsApi
          .getPage({
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel,
          })
          .subscribe({
            next: (res) => params.successCallback(res.items, res.total),
            error: () => params.failCallback(),
          });
      },
    };
  }

  /** Same column defs as client grid — schema builder is row-model agnostic. */
  protected override buildColumnDefs(): ColDef<ProductRow>[] {
    return [
      ...this.schemaBuilder.buildGroups(PRODUCT_COLUMN_GROUPS, PRODUCT_PIPELINES),
      this.columns.actions({
        headerName: '⋯',
        width: 72,
        pinned: 'right',
        onCellClicked: (e) => {
          if (e.data) console.log('Open product', e.data.id);
        },
      }),
    ];
  }

  refresh(): void {
    this.refreshInfiniteCache();
  }

  private onCellPersist(e: CellValueChangedEvent<ProductRow>): void {
    const field = e.colDef.field;
    if (!field || !e.data || e.oldValue === e.newValue) return;

    console.log('PATCH /api/products/' + e.data.id, { [field]: e.data[field] });

    const dependent = PRODUCT_DEPENDENT_COLUMNS[field] ?? [];
    if (dependent.length) {
      e.api.refreshCells({
        rowNodes: [e.node!],
        columns: dependent,
        force: true,
      });
    }
  }
}
