/**
 * Dependencies for product column pipelines — maps old `context.*` calls to injectable services.
 * Implement in your app; pass to {@link createProductPipelines}.
 */
import type { ProductRow } from './product-row.model.example';

export interface ProductFormatLike {
  formatMoneyMajor(cents: number): string;
  normalizeTaxCode(raw: string): string;
  formatTaxCodeDisplay(code: string): string;
}

export interface ProductInventoryLike {
  availableQty(row: ProductRow): number;
  isLowStock(row: ProductRow): boolean;
  inventorySummaryHtml(row: ProductRow): string;
}

export interface ProductColumnDeps {
  format: ProductFormatLike;
  inventory: ProductInventoryLike;
}
