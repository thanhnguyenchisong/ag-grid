const {
  applyFilterModel,
  applySortModel,
  parseFilterParam,
  parseSortParam,
} = require('./filter-sort');

/** @typedef {import('./filter-sort').OrderRow} _unused */

/**
 * @typedef {Object} ProductRow
 * @property {string} id
 * @property {string} sku
 * @property {string} name
 * @property {string} category
 * @property {string} status
 * @property {number} unitPriceCents
 * @property {number} costCents
 * @property {number} discountPercent
 * @property {string} taxCode
 * @property {boolean} isActive
 * @property {boolean} isDiscontinued
 * @property {boolean} vatExempt
 * @property {number} warehouseQty
 * @property {number} reservedQty
 * @property {number} weightKg
 * @property {string} manufacturedAt
 * @property {string} expiresAt
 * @property {string} supplierCode
 * @property {string} barcode
 * @property {string} approvalStatus
 * @property {number} rating
 * @property {string[]} tags
 * @property {string} notes
 * @property {string} lastAuditBy
 * @property {string} lastAuditAt
 * @property {number} reorderLevel
 * @property {number} maxOrderQty
 * @property {string} hazmatClass
 * @property {string} countryOfOrigin
 * @property {number} warrantyMonths
 * @property {string} internalCode
 */

const CATEGORIES = ['electronics', 'grocery', 'apparel', 'industrial'];
const STATUSES = ['draft', 'active', 'archived'];
const APPROVAL = ['pending', 'approved', 'rejected'];
const HAZMAT = ['none', 'low', 'medium', 'high'];
const SUPPLIERS = ['SUP-ACME', 'SUP-FARM', 'SUP-GLOBEX', 'SUP-INITECH'];
const TAG_POOL = ['b2b', 'featured', 'organic', 'perishable', 'clearance', 'import'];

/** @type {ProductRow[]} */
const PRODUCTS_DB = Array.from({ length: 500 }, (_, i) => {
  const n = i + 1;
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + (i % 365));
  const exp = new Date(date);
  exp.setFullYear(exp.getFullYear() + 2);
  const wh = 10 + (i % 200);
  const rs = i % 20;
  return {
    id: String(n),
    sku: `SKU-${String(n).padStart(5, '0')}`,
    name: `Product ${n}`,
    category: CATEGORIES[i % CATEGORIES.length],
    status: STATUSES[i % STATUSES.length],
    unitPriceCents: Math.round((n * 12500 + (i % 9) * 50000)),
    costCents: Math.round((n * 8000 + (i % 7) * 30000)),
    discountPercent: i % 5 === 0 ? 10 : i % 3 === 0 ? 5 : 0,
    taxCode: String(1000000000000 + n).slice(0, 13),
    isActive: i % 11 !== 0,
    isDiscontinued: i % 47 === 0,
    vatExempt: i % 13 === 0,
    warehouseQty: wh,
    reservedQty: rs,
    weightKg: Math.round((n % 50) * 0.35 * 10) / 10,
    manufacturedAt: date.toISOString().slice(0, 10),
    expiresAt: exp.toISOString().slice(0, 10),
    supplierCode: SUPPLIERS[i % SUPPLIERS.length],
    barcode: `8938509${String(n).padStart(6, '0')}`,
    approvalStatus: APPROVAL[i % APPROVAL.length],
    rating: Math.round((2 + (i % 4) + (i % 10) / 10) * 10) / 10,
    tags: [TAG_POOL[i % TAG_POOL.length], TAG_POOL[(i + 2) % TAG_POOL.length]],
    notes: i % 8 === 0 ? `Note for product ${n}` : '',
    lastAuditBy: i % 2 === 0 ? 'qa@example.com' : 'ops@example.com',
    lastAuditAt: date.toISOString().slice(0, 10),
    reorderLevel: 15 + (i % 40),
    maxOrderQty: 100 + (i % 10) * 50,
    hazmatClass: HAZMAT[i % HAZMAT.length],
    countryOfOrigin: i % 3 === 0 ? 'VN' : 'US',
    warrantyMonths: [0, 12, 24, 36][i % 4],
    internalCode: `INT-${String(n).padStart(4, '0')}`,
  };
});

/**
 * @param {{ offset?: string; limit?: string; sort?: string; filter?: string }} query
 */
function queryPage(query) {
  const offset = Math.max(0, Number(query.offset) || 0);
  const limit = Math.max(1, Number(query.limit) || 50);
  const sortModel = parseSortParam(query.sort);
  const filterModel = parseFilterParam(query.filter);

  let rows = PRODUCTS_DB.map((p) => ({
    ...p,
    tags: [...p.tags],
  }));
  rows = applyFilterModel(rows, filterModel);
  rows = applySortModel(rows, sortModel);

  const total = rows.length;
  const items = rows.slice(offset, offset + limit);

  return { items, total };
}

/**
 * @param {string} id
 * @param {Partial<ProductRow>} patch
 */
function update(id, patch) {
  const idx = PRODUCTS_DB.findIndex((p) => p.id === id);
  if (idx < 0) {
    const err = new Error(`Product ${id} not found`);
    err.status = 404;
    throw err;
  }
  PRODUCTS_DB[idx] = { ...PRODUCTS_DB[idx], ...patch };
  return { ...PRODUCTS_DB[idx], tags: [...PRODUCTS_DB[idx].tags] };
}

module.exports = { queryPage, update };
