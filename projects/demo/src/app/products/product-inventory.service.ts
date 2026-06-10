import { Injectable } from '@angular/core';
import type { ProductInventoryLike } from '@app/ag-grid-examples/product-column-deps.example';
import type { ProductRow } from '../product-row.model';

/** Stock calculations — was often on `context.inventoryService` in legacy grids. */
@Injectable({ providedIn: 'root' })
export class ProductInventoryService implements ProductInventoryLike {
  availableQty(row: ProductRow): number {
    return Math.max(0, row.warehouseQty - row.reservedQty);
  }

  isLowStock(row: ProductRow): boolean {
    return this.availableQty(row) <= row.reorderLevel;
  }

  inventorySummaryHtml(row: ProductRow): string {
    const wh = row.warehouseQty;
    const rs = row.reservedQty;
    const av = this.availableQty(row);
    const low = this.isLowStock(row);
    return (
      `<span title="Warehouse / Reserved / Available">` +
      `${wh} / ${rs} / ` +
      `<strong style="color:${low ? '#b45309' : 'inherit'}">${av}</strong>` +
      `</span>`
    );
  }
}
