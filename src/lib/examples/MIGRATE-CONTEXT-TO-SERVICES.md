# Migrate: grid `context` with many services → reusable services + pipelines

## Old app (anti-pattern)

```typescript
super({
  context: {
    formatService: this.formatService,
    inventoryService: this.inventoryService,
    taxService: this.taxService,
    authService: this.authService,
  },
});

// ColDef
valueGetter: (p) => p.context.formatService.formatMoney(p.data.amount),
valueSetter: (p) => p.context.taxService.apply(p),
```

Problems: untyped bag, hard to test, hidden dependencies in every ColDef.

---

## Recommended layout

```
products/
  product-format.service.ts       ← pure format (was context.formatService)
  product-inventory.service.ts    ← business rules (was context.inventoryService)
  product-column-helpers.service.ts  ← facade: getPipelines()
  products-server-grid.service.ts  ← grid: API load/save + buildColumnDefs
```

| Layer | Responsibility |
|-------|----------------|
| **Domain services** | `formatMoney`, `normalizeTaxCode`, `availableQty`, … |
| **Column helpers** | `createProductPipelines({ format, inventory })` — binds services to ColDef hooks |
| **Grid service** | `getPage`, `update`, `refresh` — HTTP only |
| **Schema** | `PRODUCT_COLUMN_GROUPS` — declarative, no logic |

---

## Step-by-step migrate

### 1. Extract methods from ColDef → domain services

Each `context.xxx.method` becomes a method on `@Injectable()` service.

### 2. Factory `createProductPipelines(deps)`

See `product-pipelines.example.ts`:

```typescript
createProductPipelines({
  format: inject(ProductFormatService),
  inventory: inject(ProductInventoryService),
});
```

Pipelines call `deps.format.normalizeTaxCode(...)` instead of `params.context...`.

### 3. Facade `ProductColumnHelpersService`

```typescript
getPipelines() {
  return createProductPipelines({
    format: this.format,
    inventory: this.inventory,
  });
}
```

Inject **once** in grid service.

### 4. Grid service stays thin

```typescript
buildColumnDefs() {
  return this.schemaBuilder.buildGroups(
    PRODUCT_COLUMN_GROUPS,
    this.columnHelpers.getPipelines(),
  );
}
```

HTTP: only `createInfiniteDatasource` + `onCellPersist`.

### 5. What still can use `context` (small)

```typescript
context: {
  canEdit: this.auth.canEdit(),
  onOpenDetail: (id) => this.router.navigate(...),
}
```

Flags + callbacks — **not** whole services.

---

## Client vs server

Same `getPipelines()` + `PRODUCT_COLUMN_GROUPS` for both.

| | Client | Server |
|---|--------|--------|
| Pipelines | `columnHelpers.getPipelines()` | **Same** |
| Data | `setRowData` | `productsApi.getPage` |
| Save | `onCellPersist` → API | **Same** |

---

## Live demo

- `projects/demo/src/app/products/product-column-helpers.service.ts`
- `projects/demo/src/app/products-server-grid.service.ts`
