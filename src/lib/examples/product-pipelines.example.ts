import type { ICellRendererParams } from 'ag-grid-community';
import type { FieldPipelineMap } from '../columns/column-schema.types';
import type { ProductColumnDeps } from './product-column-deps.example';
import type { ProductPipeline } from './product-columns.schema.example';
import type { ProductRow } from './product-row.model.example';

/** Refresh computed columns when a source field is edited. */
export const PRODUCT_DEPENDENT_COLUMNS: Partial<
  Record<keyof ProductRow | string, string[]>
> = {
  name: ['fullLabel', 'pricingSummary'],
  sku: ['fullLabel'],
  unitPriceCents: ['marginPercent', 'pricingSummary'],
  costCents: ['marginPercent'],
  discountPercent: ['pricingSummary'],
  warehouseQty: ['availableQty', 'inventorySummary'],
  reservedQty: ['availableQty', 'inventorySummary'],
  reorderLevel: ['availableQty', 'inventorySummary'],
  approvalStatus: ['complianceSummary'],
  hazmatClass: ['complianceSummary'],
  vatExempt: ['complianceSummary'],
};

/** Default pure implementations (no Angular DI) — used in docs/tests. */
export const defaultProductFormat: ProductColumnDeps['format'] = {
  formatMoneyMajor(cents: number) {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
      cents / 100,
    );
  },
  normalizeTaxCode(raw: string) {
    return raw.replace(/\D/g, '').slice(0, 13);
  },
  formatTaxCodeDisplay(code: string) {
    const d = code.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  },
};

export const defaultProductInventory: ProductColumnDeps['inventory'] = {
  availableQty(row) {
    return Math.max(0, row.warehouseQty - row.reservedQty);
  },
  isLowStock(row) {
    return this.availableQty(row) <= row.reorderLevel;
  },
  inventorySummaryHtml(row) {
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
  },
};

/**
 * Build pipeline map — inject app services instead of passing them via grid `context`.
 *
 * Migrate pattern:
 * - Old: `context.formatService.formatMoney(...)` inside ColDef
 * - New: `createProductPipelines({ format: formatService, inventory: ... })`
 */
export function createProductPipelines(
  deps: ProductColumnDeps = {
    format: defaultProductFormat,
    inventory: defaultProductInventory,
  },
): FieldPipelineMap<ProductRow, ProductPipeline> {
  const { format, inventory } = deps;

  return {
    fullLabel: {
      valueGetter: (p) => (p.data ? `[${p.data.sku}] ${p.data.name}` : ''),
    },

    pricingSummary: {
      valueGetter: (p) => {
        if (!p.data) return null;
        return {
          price: p.data.unitPriceCents,
          discount: p.data.discountPercent,
        };
      },
      cellRenderer: (p: ICellRendererParams<ProductRow>) => {
        const v = p.value as { price: number; discount: number } | null;
        if (!v) return '';
        const price = format.formatMoneyMajor(v.price);
        const disc =
          v.discount > 0
            ? `<span style="color:#16a34a;margin-left:6px">-${v.discount}%</span>`
            : '';
        return `<strong>${price} ₫</strong>${disc}`;
      },
    },

    marginPercent: {
      valueGetter: (p) => {
        if (!p.data?.unitPriceCents || !p.data.costCents) return null;
        const price = p.data.unitPriceCents / 100;
        const cost = p.data.costCents / 100;
        if (price <= 0) return null;
        return Math.round(((price - cost) / price) * 1000) / 10;
      },
      valueFormatter: (p) => (p.value == null ? '—' : `${p.value}%`),
    },

    availableQty: {
      valueGetter: (p) => (p.data ? inventory.availableQty(p.data) : null),
      cellRenderer: (p: ICellRendererParams<ProductRow>) => {
        const v = p.value as number;
        if (v == null || !p.data) return '';
        const low = inventory.isLowStock(p.data);
        return low
          ? `<span style="color:#b45309;font-weight:600">${v} ⚠</span>`
          : String(v);
      },
    },

    inventorySummary: {
      cellRenderer: (p: ICellRendererParams<ProductRow>) =>
        p.data ? inventory.inventorySummaryHtml(p.data) : '',
    },

    vietnamTaxCode: {
      valueParser: (p) => format.normalizeTaxCode(String(p.newValue ?? '')),
      valueSetter: (p) => {
        if (!p.data) return false;
        p.data.taxCode = format.normalizeTaxCode(String(p.newValue ?? ''));
        return true;
      },
      valueFormatter: (p) => format.formatTaxCodeDisplay(String(p.value ?? '')),
    },

    tagsDisplay: {
      valueGetter: (p) => (p.data?.tags ?? []).join(', '),
      valueFormatter: (p) => String(p.value ?? ''),
    },

    ratingStars: {
      valueFormatter: (p) => {
        const n = Math.min(5, Math.max(0, Number(p.value) || 0));
        return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
      },
      filter: 'agNumberColumnFilter',
    },

    hazmatBadge: {
      valueFormatter: (p) => {
        const c = String(p.value ?? '').trim();
        if (!c || c === 'none') return '—';
        return `⬤ ${c.toUpperCase()}`;
      },
      cellRenderer: (p: ICellRendererParams<ProductRow>) => {
        const c = String(p.value ?? '');
        const color =
          c === 'high' ? '#dc2626' : c === 'medium' ? '#d97706' : '#16a34a';
        return `<span style="color:${color}">${p.valueFormatted ?? c}</span>`;
      },
    },

    complianceSummary: {
      cellRenderer: (p: ICellRendererParams<ProductRow>) => {
        if (!p.data) return '';
        const approval = p.data.approvalStatus;
        const haz = p.data.hazmatClass || 'none';
        const vat = p.data.vatExempt ? 'VAT exempt' : 'VAT';
        const approvalColor =
          approval === 'approved'
            ? '#16a34a'
            : approval === 'rejected'
              ? '#dc2626'
              : '#d97706';
        return (
          `<span style="color:${approvalColor};font-weight:600">${approval}</span>` +
          ` · ${haz} · <em>${vat}</em>`
        );
      },
    },
  };
}

/** Static pipelines without DI — convenience for examples. */
export const PRODUCT_PIPELINES = createProductPipelines();
