import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  OrdersPageRequest,
  OrdersPageResponse,
} from './orders-query.types';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  /**
   * GET /api/orders?offset=&limit=&sort=&filter=
   * Backend must return { items: OrderRow[], total: number }.
   */
  getPage(request: OrdersPageRequest): Observable<OrdersPageResponse> {
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

    return this.http.get<OrdersPageResponse>(this.base, { params });
  }
}
