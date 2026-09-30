export interface AccessTokenPayload {
  userId: string;
  role: "customer" | "cook" | "admin";
}

export interface RefreshTokenPayload {
  userId: string;
}