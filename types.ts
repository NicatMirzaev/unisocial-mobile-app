export type RootStackParamList = {
  Main: { token: string };
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  ResetPasswordVerification: { email: string };
  NewPassword: { token: string };
  EmailVerification: { email: string };
  ImagesView: { images: Photo[]; index: number };
  Profile: { userId: string };
};

export interface User {
  _id: string;
  fullName: string;
  profileImg: string;
  program: string;
  isPremium: string;
  nextBillingDate: Date | null;
}

export interface Photo {
  _id: string;
  _userId: string;
  url: string;
}

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};
