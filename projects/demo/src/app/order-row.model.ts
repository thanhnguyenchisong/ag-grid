/** Known order fields — use for API contracts and utility types. */
export interface OrderRowFields {
  id: string;
  orderNo: string;
  customer: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
}

/** Grid row type — index signature supports dynamic field access. */
export interface OrderRow extends OrderRowFields {
  [key: string]: unknown;
}
