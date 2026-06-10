# Demo API contract

The demo loads all data from the sample backend at `http://localhost:3000`.

```bash
npm start              # API (:3000) + Angular demo (:4200)
npm run start:api      # API only
npm run start:demo     # Angular only (needs API running separately)
```

Source: [`server/`](server/) — Express in-memory store.

In dev, `ng serve` proxies `/api` → `http://localhost:3000` (see `proxy.conf.json`).

Change base URL in `src/environments/environment.ts`.

## Users (client-side grid)

### `GET /api/users`

Response: `200` + JSON array:

```json
[
  {
    "id": "1",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "createdAt": "2025-01-15",
    "isActive": true
  }
]
```

### `DELETE /api/users`

Request body:

```json
{ "ids": ["1", "2"] }
```

Response: `204` or `200`.

### `PATCH /api/users/:id`

Request body: partial user fields, e.g. `{ "email": "new@example.com" }`.

Response: `200` + updated user object.

---

## Orders (infinite / server-driven grid)

### `GET /api/orders`

Query parameters:

| Param | Example | Description |
|-------|---------|-------------|
| `offset` | `0` | Start row index |
| `limit` | `50` | Page size (`endRow - startRow`) |
| `sort` | `createdAt:desc,total:asc` | Optional, comma-separated `colId:direction` |
| `filter` | `{"status":{"filterType":"set","values":["paid"]}}` | Optional, JSON string (AG Grid `filterModel`) |

Response: `200` + JSON:

```json
{
  "items": [
    {
      "id": "1",
      "orderNo": "ORD-00001",
      "customer": "Acme Corp",
      "status": "paid",
      "total": 1250.5,
      "createdAt": "2025-01-15"
    }
  ],
  "total": 500
}
```

`total` = row count **after** server-side filter (for correct scrollbar).

---

## Products (complex server-driven grid — demo tab 3)

Same query contract as orders. **500** products with ~30 fields (see `server/products-store.js`).

### `GET /api/products`

Query: `offset`, `limit`, `sort`, `filter` (same as orders).

Response: `{ items: ProductRow[], total: number }`.

### `PATCH /api/products/:id`

Partial update for inline edit on field columns.
