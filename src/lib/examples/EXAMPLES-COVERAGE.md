# Complex grid example — coverage matrix

References:
- Client: `complex-product-grid.service.example.ts`
- **Server: `complex-product-server-grid.service.example.ts`**
- Live demo tab: `projects/demo/.../products-server-grid.service.ts`
- Schema: `product-columns.schema.example.ts`
- Pipelines: `product-pipelines.example.ts`

## Covered — client-side

| Case | How |
|------|-----|
| ~30 leaf columns | `PRODUCT_COLUMN_GROUPS` |
| Column header groups | `ColumnSchemaBuilder.buildGroups()` |
| Row model 2-layer | `ProductRowFields` + `ProductRow` |
| Kinds: text / number / date / money / percent / boolean / enum | `kind` in schema |
| Computed columns | `colId` + `kind: 'computed'` |
| Multi-field one cell | `pricingSummary`, `inventorySummary`, `complianceSummary` |
| Custom parser / setter / formatter / renderer | Named `pipeline`s |
| Validation | `required()` on `name` |
| Inline edit + persist hook | `onCellValueChanged` |
| Dependent column refresh | `PRODUCT_DEPENDENT_COLUMNS` |
| `getRowId` | gridOptions |

## Covered — server-side (Infinite Row Model)

| Case | How |
|------|-----|
| **Infinite datasource** | `createInfiniteDatasource()` — no `setRowData()` |
| **HTTP blocks** | `GET /api/products?offset&limit&sort&filter` |
| **Same schema + groups + pipelines** | Shared `PRODUCT_COLUMN_GROUPS` + `PRODUCT_PIPELINES` |
| **Server sort / filter** | On **field** columns via API (`products-store.js`) |
| **Computed cols client-only** | Rendered per loaded row; sort/filter on `colId`-only cols N/A server |
| **Inline edit + PATCH** | `onCellValueChanged` → `PATCH /api/products/:id` |
| **Cache refresh** | `refresh()` → `refreshInfiniteCache()` |
| **500 rows** | `products-store.js` seed |

## Server vs client — shared vs different

| | Client | Server |
|---|--------|--------|
| Column defs | `buildGroups(schema, pipelines)` | **Same** |
| Load data | `setRowData()` | `successCallback(items, total)` |
| Pagination | Client | Virtual scroll + blocks |
| Sort/filter | AG Grid client | **API** (demo backend) |
| Computed columns | `valueGetter` / `cellRenderer` | **Same** (per visible row) |

## Not covered (other examples)

| Case | Where |
|------|--------|
| SSRM (Enterprise) | `orders-ssrm-grid.service.example.ts` |
| `GridContext` | docs Bài 8 |
| Angular cell component | docs Bài 18 |
| Validation yellow badge | `users-grid.service.ts` |
| Master-detail / row grouping | Enterprise |

## Migrate checklist (50 fields, server)

1. `ProductRowFields` + API page contract `{ items, total }`
2. `PRODUCT_COLUMN_GROUPS` — group related headers
3. `PRODUCT_PIPELINES` — once per display pattern
4. `ComplexProductServerGridService` — `createInfiniteDatasource()`
5. **Reuse** `buildColumnDefs()` from client — only datasource differs
6. Sort/filter: implement on backend for stored fields only
