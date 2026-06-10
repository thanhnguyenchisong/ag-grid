import { Injectable } from '@angular/core';
import type { ProductFormatLike } from '@app/ag-grid-examples/product-column-deps.example';

/** Reusable format logic — was often on `context.formatService` in legacy grids. */
@Injectable({ providedIn: 'root' })
export class ProductFormatService implements ProductFormatLike {
  formatMoneyMajor(cents: number): string {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
      cents / 100,
    );
  }

  normalizeTaxCode(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 13);
  }

  formatTaxCodeDisplay(code: string): string {
    const d = code.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
}
