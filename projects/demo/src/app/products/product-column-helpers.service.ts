import { Injectable, inject } from '@angular/core';
import type { FieldPipelineMap } from '@app/ag-grid-common';
import { createProductPipelines } from '@app/ag-grid-examples/product-pipelines.example';
import type { ProductPipeline } from '@app/ag-grid-examples/product-columns.schema.example';
import type { ProductRow } from '../product-row.model';
import { ProductFormatService } from './product-format.service';
import { ProductInventoryService } from './product-inventory.service';

/**
 * Column helper facade — replaces dumping many services into grid `context`.
 *
 * Legacy:  context: { formatSvc, inventorySvc, taxSvc, ... }
 * Migrate: inject helpers here → getPipelines() for ColumnSchemaBuilder
 */
@Injectable({ providedIn: 'root' })
export class ProductColumnHelpersService {
  private readonly format = inject(ProductFormatService);
  private readonly inventory = inject(ProductInventoryService);

  private cached?: FieldPipelineMap<ProductRow, ProductPipeline>;

  /** Pipelines with bound service methods — safe to pass to buildGroups(). */
  getPipelines(): FieldPipelineMap<ProductRow, ProductPipeline> {
    if (!this.cached) {
      this.cached = createProductPipelines({
        format: this.format,
        inventory: this.inventory,
      });
    }
    return this.cached;
  }
}
