export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  phone: string;
};

export type AuthResponse = {
  token: string;
};
