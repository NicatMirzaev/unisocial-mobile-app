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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(defaultUser);
    setMounted(true);
  }, [defaultUser]);

  if (!mounted) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserProvider;
