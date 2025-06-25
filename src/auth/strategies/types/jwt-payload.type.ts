export type JwtPayloadType = {
  id: string;
  role: any;
  sessionId: string;
  iat: number;
  exp: number;
};