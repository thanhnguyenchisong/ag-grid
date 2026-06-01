import type { Provider } from '@angular/core';
import {
  AG_GRID_DEFAULTS,
  type AgGridDefaults,
} from '../tokens/ag-grid-defaults.token';

/** Register global AG Grid defaults in `app.config.ts`. */
export function provideAgGridDefaults(defaults: AgGridDefaults): Provider {
  return { provide: AG_GRID_DEFAULTS, useValue: defaults };
}
