/** Known user fields — use for API contracts and utility types. */
export interface UserRowFields {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

/** Grid row type — index signature supports dynamic field access (e.g. inline edit). */
export interface UserRow extends UserRowFields {
  [key: string]: unknown;
}
