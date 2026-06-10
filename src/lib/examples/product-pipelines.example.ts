import type { ICellRendererParams } from 'ag-grid-community';
import type { FieldPipelineMap } from '../columns/column-schema.types';
import type { ProductPipeline } from './product-columns.schema.example';
import type { ProductRow } from './product-row.model.example';

/** Refresh computed columns when a source field is edited (client-side grids). */
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

export function formatMoneyMajor(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export function normalizeTaxCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 13);
}

export function formatTaxCodeDisplay(code: string): string {
  const d = code.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Shared display / edit pipelines for client and server product grids. */
export const PRODUCT_PIPELINES: FieldPipelineMap<ProductRow, ProductPipeline> = {
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
      const price = formatMoneyMajor(v.price);
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
    valueGetter: (p) => {
      if (!p.data) return null;
      return Math.max(0, p.data.warehouseQty - p.data.reservedQty);
    },
    cellRenderer: (p: ICellRendererParams<ProductRow>) => {
      const v = p.value as number;
      if (v == null) return '';
      const low = p.data && v <= p.data.reorderLevel;
      return low
        ? `<span style="color:#b45309;font-weight:600">${v} ⚠</span>`
        : String(v);
    },
  },

  inventorySummary: {
    cellRenderer: (p: ICellRendererParams<ProductRow>) => {
      if (!p.data) return '';
      const wh = p.data.warehouseQty;
      const rs = p.data.reservedQty;
      const av = Math.max(0, wh - rs);
      const low = av <= p.data.reorderLevel;
      return (
        `<span title="Warehouse / Reserved / Available">` +
        `${wh} / ${rs} / ` +
        `<strong style="color:${low ? '#b45309' : 'inherit'}">${av}</strong>` +
        `</span>`
      );
    },
  },

  vietnamTaxCode: {
    valueParser: (p) => normalizeTaxCode(String(p.newValue ?? '')),
    valueSetter: (p) => {
      if (!p.data) return false;
      p.data.taxCode = normalizeTaxCode(String(p.newValue ?? ''));
      return true;
    },
    valueFormatter: (p) => formatTaxCodeDisplay(String(p.value ?? '')),
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
