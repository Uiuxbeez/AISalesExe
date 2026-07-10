export type SessionPayload = {
  email: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult =
  | { success: true; name: string }
  | { success: false; error: string };

export type SignupInput = {
  name: string;
  businessName: string;
  email: string;
  password: string;
};

export type SignupResult =
  | { success: true; name: string; email: string }
  | { success: false; error: string };
