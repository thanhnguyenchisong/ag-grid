/**
 * COMPLEX CLIENT-SIDE TABLE — schema + column groups + pipelines.
 * Server-driven variant: complex-product-server-grid.service.example.ts
 * Coverage: EXAMPLES-COVERAGE.md
 */
import { Injectable } from '@angular/core';
import type { CellValueChangedEvent, ColDef, GridOptions } from 'ag-grid-community';
import { AgGridBase } from '../core/ag-grid-base';
import { ColumnSchemaBuilder } from '../columns/column-schema-builder';
import { PRODUCT_COLUMN_GROUPS } from './product-columns.schema.example';
import {
  PRODUCT_DEPENDENT_COLUMNS,
  createProductPipelines,
} from './product-pipelines.example';
import type { ProductRow } from './product-row.model.example';

// @Injectable()
export class ComplexProductGridService extends AgGridBase<ProductRow> {
  private readonly schemaBuilder = new ColumnSchemaBuilder<ProductRow>(this.columns);

  constructor() {
    super({ id: 'products-grid', paginationPageSize: 25 });
  }

  protected override getDefaultGridOptions(): GridOptions<ProductRow> {
    return {
      ...super.getDefaultGridOptions(),
      getRowId: (p) => p.data.id,
      onCellValueChanged: (e) => this.onCellPersist(e),
    };
  }

  protected override buildColumnDefs(): ColDef<ProductRow>[] {
    return [
      this.columns.checkbox(),
      ...this.schemaBuilder.buildGroups(
        PRODUCT_COLUMN_GROUPS,
        createProductPipelines(),
      ),
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

  protected override onGridReady(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.showLoading();
    this.setRowData(seedProducts());
    this.hideLoading();
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

function seedProducts(): ProductRow[] {
  return [
    {
      id: '1',
      sku: 'EL-1001',
      name: 'Industrial Sensor',
      category: 'industrial',
      status: 'active',
      unitPriceCents: 1_250_050,
      costCents: 890_000,
      discountPercent: 5,
      taxCode: '0123456789012',
      isActive: true,
      isDiscontinued: false,
      vatExempt: false,
      warehouseQty: 120,
      reservedQty: 15,
      weightKg: 2.4,
      manufacturedAt: '2025-01-10',
      expiresAt: '2028-01-10',
      supplierCode: 'SUP-ACME',
      barcode: '8938509123456',
      internalCode: 'INT-001',
      approvalStatus: 'approved',
      rating: 4.5,
      tags: ['b2b', 'featured'],
      notes: 'High demand SKU',
      lastAuditBy: 'qa@example.com',
      lastAuditAt: '2025-06-01',
      reorderLevel: 20,
      maxOrderQty: 500,
      hazmatClass: 'low',
      countryOfOrigin: 'VN',
      warrantyMonths: 24,
    },
  ];
}
