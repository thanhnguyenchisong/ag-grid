export interface OrderRow {
  id: string;
  orderNo: string;
  customer: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
  [key: string]: unknown;
}
