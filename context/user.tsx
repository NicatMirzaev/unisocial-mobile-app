import {
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { UserContextType, User } from "../types";

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

const UserProvider = ({
  children,
  defaultUser,
}: {
  children: ReactNode;
  defaultUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(defaultUser);
  }, [defaultUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserProvider;
