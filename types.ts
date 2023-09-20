export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
  ImagesView: { images: Photo[]; index: number };
};

export interface User {
  _id: string;
  fullName: string;
  profileImg: string;
  program: string;
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
