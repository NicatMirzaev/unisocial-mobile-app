export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
};

export interface User {
  _id: string;
  fullName: string;
  profileImg: string;
}

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};
