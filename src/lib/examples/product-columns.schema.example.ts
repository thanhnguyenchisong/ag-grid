import { required } from '../validation/validators';
import type {
  ColumnGroupSchema,
  ColumnSchema,
} from '../columns/column-schema.types';
import type { ProductRowFields } from './product-row.model.example';

/** Named custom pipelines — implemented once in the grid service. */
export type ProductPipeline =
  | 'fullLabel'
  | 'availableQty'
  | 'marginPercent'
  | 'vietnamTaxCode'
  | 'tagsDisplay'
  | 'ratingStars'
  | 'hazmatBadge'
  /** One cell — unit price + discount (multi-field display). */
  | 'pricingSummary'
  /** One cell — approval + hazmat + VAT flag (multi-field display). */
  | 'complianceSummary'
  /** One cell — warehouse / reserved / available (multi-field display). */
  | 'inventorySummary';

/**
 * Column groups — parent headers for related fields.
 * Each group uses schema lines + optional multi-field pipeline columns.
 */
export const PRODUCT_COLUMN_GROUPS: ColumnGroupSchema<
  ProductRowFields,
  ProductPipeline
>[] = [
  {
    groupId: 'identity',
    headerName: 'Identity',
    marryChildren: true,
    children: [
      { field: 'sku', kind: 'text', flex: 1.2, pinned: 'left' },
      { field: 'name', kind: 'text', flex: 2, editable: true, validate: required() },
      {
        colId: 'fullLabel',
        kind: 'computed',
        pipeline: 'fullLabel',
        headerName: 'SKU · Name',
        flex: 2,
      },
      {
        field: 'category',
        kind: 'enum',
        enumValues: ['electronics', 'grocery', 'apparel', 'industrial'],
      },
      {
        field: 'status',
        kind: 'enum',
        enumValues: ['draft', 'active', 'archived'],
        editable: true,
      },
    ],
  },
  {
    groupId: 'pricing',
    headerName: 'Pricing & tax',
    children: [
      {
        colId: 'pricingSummary',
        kind: 'computed',
        pipeline: 'pricingSummary',
        headerName: 'Price summary',
        flex: 1.4,
      },
      {
        field: 'unitPriceCents',
        kind: 'money',
        headerName: 'Unit price',
        editable: true,
        flex: 1.1,
      },
      { field: 'costCents', kind: 'money', headerName: 'Cost', editable: true },
      {
        colId: 'marginPercent',
        kind: 'computed',
        pipeline: 'marginPercent',
        headerName: 'Margin %',
        flex: 0.9,
      },
      {
        field: 'discountPercent',
        kind: 'percent',
        headerName: 'Discount',
        editable: true,
      },
      {
        field: 'taxCode',
        kind: 'text',
        pipeline: 'vietnamTaxCode',
        headerName: 'Tax code',
        editable: true,
      },
    ],
  },
  {
    groupId: 'flags',
    headerName: 'Flags',
    children: [
      { field: 'isActive', kind: 'boolean', headerName: 'Active' },
      { field: 'isDiscontinued', kind: 'boolean', headerName: 'Discontinued' },
      { field: 'vatExempt', kind: 'boolean', headerName: 'VAT exempt' },
    ],
  },
  {
    groupId: 'inventory',
    headerName: 'Inventory',
    children: [
      {
        colId: 'inventorySummary',
        kind: 'computed',
        pipeline: 'inventorySummary',
        headerName: 'Stock summary',
        flex: 1.5,
      },
      { field: 'warehouseQty', kind: 'number', headerName: 'Warehouse', editable: true },
      { field: 'reservedQty', kind: 'number', headerName: 'Reserved' },
      {
        colId: 'availableQty',
        kind: 'computed',
        pipeline: 'availableQty',
        headerName: 'Available',
      },
      { field: 'reorderLevel', kind: 'number', headerName: 'Reorder at', editable: true },
      { field: 'maxOrderQty', kind: 'number', headerName: 'Max order', editable: true },
      { field: 'weightKg', kind: 'number', headerName: 'Weight (kg)', editable: true },
    ],
  },
  {
    groupId: 'dates',
    headerName: 'Dates',
    children: [
      { field: 'manufacturedAt', kind: 'date', headerName: 'Manufactured' },
      { field: 'expiresAt', kind: 'date', headerName: 'Expires', editable: true },
    ],
  },
  {
    groupId: 'sourcing',
    headerName: 'Sourcing',
    children: [
      { field: 'supplierCode', kind: 'text', editable: true },
      { field: 'barcode', kind: 'text', flex: 1.2 },
      { field: 'internalCode', kind: 'text', headerName: 'Internal' },
      { field: 'countryOfOrigin', kind: 'text', headerName: 'Origin' },
    ],
  },
  {
    groupId: 'quality',
    headerName: 'Quality & compliance',
    children: [
      {
        colId: 'complianceSummary',
        kind: 'computed',
        pipeline: 'complianceSummary',
        headerName: 'Compliance',
        flex: 1.3,
      },
      {
        field: 'approvalStatus',
        kind: 'enum',
        enumValues: ['pending', 'approved', 'rejected'],
      },
      { field: 'rating', kind: 'number', pipeline: 'ratingStars', headerName: 'Rating' },
      { field: 'tags', kind: 'text', pipeline: 'tagsDisplay', headerName: 'Tags' },
      { field: 'hazmatClass', kind: 'text', pipeline: 'hazmatBadge', headerName: 'Hazmat' },
      { field: 'warrantyMonths', kind: 'number', headerName: 'Warranty (mo)' },
    ],
  },
  {
    groupId: 'audit',
    headerName: 'Audit',
    children: [
      { field: 'notes', kind: 'text', flex: 2, editable: true },
      { field: 'lastAuditBy', kind: 'text', headerName: 'Audited by' },
      { field: 'lastAuditAt', kind: 'date', headerName: 'Audited at' },
    ],
  },
];

/** Flat list — use with `schemaBuilder.build()` when column groups are not needed. */
export const PRODUCT_COLUMN_SCHEMA: ColumnSchema<
  ProductRowFields,
  ProductPipeline
>[] = PRODUCT_COLUMN_GROUPS.flatMap((g) => [...g.children]);
