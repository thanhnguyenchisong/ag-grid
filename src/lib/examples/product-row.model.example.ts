/**
 * Reference row model for complex grid example.
 * `ProductRowFields` — utility types, API, BooleanKeys (no index signature).
 * `ProductRow` — grid row with dynamic field access.
 */
export type ProductRowFields = {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  unitPriceCents: number;
  costCents: number;
  discountPercent: number;
  taxCode: string;
  isActive: boolean;
  isDiscontinued: boolean;
  warehouseQty: number;
  reservedQty: number;
  weightKg: number;
  manufacturedAt: string;
  expiresAt: string;
  supplierCode: string;
  barcode: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  tags: string[];
  notes: string;
  lastAuditBy: string;
  lastAuditAt: string;
  reorderLevel: number;
  maxOrderQty: number;
  hazmatClass: string;
  countryOfOrigin: string;
  warrantyMonths: number;
  internalCode: string;
  vatExempt: boolean;
};

export type ProductRow = ProductRowFields & Record<string, unknown>;
