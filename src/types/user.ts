export interface UserName {
  first: string;
  middle?: string | null;
  last: string;
  _id?: string;
}
export interface UserImage {
  url: string;
  alt: string;
  _id?: string;
}
export interface UserAddress {
  state?: string;
  country: string;
  city: string;
  street: string;
  houseNumber: number;
  zip?: number;
  _id?: string;
}
export interface User {
  _id: string;
  name: UserName;
  phone: string;
  email: string;
  image: UserImage;
  address: UserAddress;
  isAdmin: boolean;
  isBusiness: boolean;
  createdAt: string;
}
export interface SignInDto {
  email: string;
  password: string;
}
export interface SignUpDto {
  name: UserName;
  phone: string;
  email: string;
  password: string;
  image?: Partial<UserImage>;
  address: UserAddress;
  isBusiness?: boolean;
}
export interface AuthResponse {
  token: string;
}
export interface CreateUserResponse {
  _id: string;
}
