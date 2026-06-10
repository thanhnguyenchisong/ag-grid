import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { UserRow } from '../user-row.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  /** GET /api/users */
  getAll(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(this.base);
  }

  /** DELETE /api/users — body: { ids: string[] } */
  deleteMany(ids: string[]): Observable<void> {
    return this.http.delete<void>(this.base, { body: { ids } });
  }

  /** PATCH /api/users/:id — inline edit */
  update(id: string, patch: Partial<UserRow>): Observable<UserRow> {
    return this.http.patch<UserRow>(`${this.base}/${id}`, patch);
  }
}
