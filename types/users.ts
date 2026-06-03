export type AppUser = {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  roleSlug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  name: string;
  roleId: string;
  password?: string;
  active?: boolean;
  authId?: string;
};

export type UpdateUserInput = {
  email?: string;
  name?: string;
  roleId?: string;
  password?: string;
  active?: boolean;
};
