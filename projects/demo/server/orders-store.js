const {
  applyFilterModel,
  applySortModel,
  parseFilterParam,
  parseSortParam,
} = require('./filter-sort');

/** @typedef {import('./filter-sort').OrderRow} OrderRow */

const STATUSES = ['pending', 'paid', 'cancelled'];
const CUSTOMERS = [
  'Acme Corp',
  'Globex',
  'Initech',
  'Umbrella',
  'Stark Industries',
  'Wayne Enterprises',
];

/** @type {OrderRow[]} */
const ORDERS_DB = Array.from({ length: 500 }, (_, i) => {
  const n = i + 1;
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + (i % 365));
  return {
    id: String(n),
    orderNo: `ORD-${String(n).padStart(5, '0')}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    status: STATUSES[i % STATUSES.length],
    total: Math.round((n * 137.5 + (i % 7) * 1000) * 100) / 100,
    createdAt: date.toISOString().slice(0, 10),
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

  let rows = [...ORDERS_DB];
  rows = applyFilterModel(rows, filterModel);
  rows = applySortModel(rows, sortModel);

  const total = rows.length;
  const items = rows.slice(offset, offset + limit);

  return { items, total };
}

module.exports = { queryPage };
