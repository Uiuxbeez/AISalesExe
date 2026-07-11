export type AccountInfo = {
  email: string;
  name: string;
  businessName: string;
  memberSince: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResult = { success: true } | { success: false; error: string };
