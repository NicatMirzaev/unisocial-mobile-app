import { createContext, useContext } from "react";

export const ThemeContext = createContext({
  toggleTheme: () => {},
  theme: "light",
});

export const useThemeContext = () => useContext(ThemeContext);
