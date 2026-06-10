import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  ProductsPageRequest,
  ProductsPageResponse,
} from './products-query.types';
import type { ProductRow } from '../product-row.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  getPage(request: ProductsPageRequest): Observable<ProductsPageResponse> {
    const limit = request.endRow - request.startRow;
    let params = new HttpParams()
      .set('offset', String(request.startRow))
      .set('limit', String(limit));

    if (request.sortModel.length) {
      const sort = request.sortModel
        .map((s) => `${s.colId}:${s.sort}`)
        .join(',');
      params = params.set('sort', sort);
    }

    if (
      request.filterModel &&
      typeof request.filterModel === 'object' &&
      Object.keys(request.filterModel as object).length
    ) {
      params = params.set('filter', JSON.stringify(request.filterModel));
    }

    return this.http.get<ProductsPageResponse>(this.base, { params });
  }

  update(id: string, patch: Partial<ProductRow>): Observable<ProductRow> {
    return this.http.patch<ProductRow>(`${this.base}/${id}`, patch);
  }
}
