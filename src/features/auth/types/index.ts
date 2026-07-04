export type SessionPayload = {
  email: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult =
  | { success: true }
  | { success: false; error: string };
