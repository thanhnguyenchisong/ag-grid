/** @typedef {{ id: string; orderNo: string; customer: string; status: string; total: number; createdAt: string }} OrderRow */

/**
 * @param {OrderRow[]} rows
 * @param {{ colId: string; sort: string }[]} sortModel
 */
function applySortModel(rows, sortModel) {
  if (!sortModel?.length) return rows;
  const { colId, sort } = sortModel[0];
  const dir = sort === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[colId];
    const bv = b[colId];
    if (av == null && bv == null) return 0;
    if (av == null) return -dir;
    if (bv == null) return dir;
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir;
    }
    return String(av).localeCompare(String(bv)) * dir;
  });
}

/**
 * @param {OrderRow[]} rows
 * @param {unknown} filterModel
 */
function applyFilterModel(rows, filterModel) {
  if (!filterModel || typeof filterModel !== 'object') return rows;
  return rows.filter((row) =>
    Object.entries(filterModel).every(([field, model]) =>
      matchesFilter(row, field, /** @type {Record<string, unknown>} */ (model)),
    ),
  );
}

/**
 * @param {OrderRow} row
 * @param {string} field
 * @param {Record<string, unknown>} model
 */
function matchesFilter(row, field, model) {
  const value = row[field];
  const filterType = /** @type {string | undefined} */ (model['filterType']);

  if (filterType === 'text') {
    const filter = String(model['filter'] ?? '').toLowerCase();
    if (!filter) return true;
    const type = /** @type {string | undefined} */ (model['type']);
    const cell = String(value ?? '').toLowerCase();
    if (type === 'equals') return cell === filter;
    return cell.includes(filter);
  }

  if (filterType === 'number') {
    const num = Number(value);
    const filter = Number(model['filter']);
    if (Number.isNaN(filter)) return true;
    const type = /** @type {string | undefined} */ (model['type']);
    switch (type) {
      case 'greaterThan':
        return num > filter;
      case 'lessThan':
        return num < filter;
      case 'equals':
        return num === filter;
      default:
        return num >= filter;
    }
  }

  if (filterType === 'set') {
    const values = /** @type {unknown[] | undefined} */ (model['values']);
    if (!values?.length) return true;
    return values.includes(value);
  }

  if (filterType === 'date') {
    const cell = String(value ?? '');
    const from = /** @type {string | undefined} */ (model['dateFrom']);
    const to = /** @type {string | undefined} */ (model['dateTo']);
    if (from && cell < from.slice(0, 10)) return false;
    if (to && cell > to.slice(0, 10)) return false;
    return true;
  }

  return true;
}

/**
 * @param {string | undefined} sortParam e.g. "createdAt:desc,total:asc"
 * @returns {{ colId: string; sort: string }[]}
 */
function parseSortParam(sortParam) {
  if (!sortParam?.trim()) return [];
  return sortParam.split(',').map((part) => {
    const [colId, sort] = part.split(':');
    return { colId: colId?.trim() ?? '', sort: sort?.trim() ?? 'asc' };
  });
}

/**
 * @param {string | undefined} filterParam JSON string
 */
function parseFilterParam(filterParam) {
  if (!filterParam?.trim()) return undefined;
  try {
    return JSON.parse(filterParam);
  } catch {
    return undefined;
  }
}

module.exports = {
  applySortModel,
  applyFilterModel,
  parseSortParam,
  parseFilterParam,
};
