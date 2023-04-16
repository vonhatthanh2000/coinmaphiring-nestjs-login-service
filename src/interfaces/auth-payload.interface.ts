export interface AuthPayload {
  id: number | string;
  name: null | string;
  email: string;
}

export interface UserLogin {
  email: string | null;
  username: string | null;
}
