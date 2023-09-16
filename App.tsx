import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { AlertNotificationRoot } from "react-native-alert-notification";
import Screens from "./screens/Screens";
import UserProvider from "./context/user";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchData } from "./lib/helpers";
import { CombinedDarkTheme, CombinedDefaultTheme } from "./themes";
import { ThemeContext } from "./context/theme";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = useCallback(() => {
    return setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const preferences = useMemo(
    () => ({
      toggleTheme,
      theme,
    }),
    [toggleTheme, theme]
  );

  useEffect(() => {
    async function prepare() {
      try {
        const data = await fetchData("/users/me");
        if (data.success) {
          setUser(data.data);
        }
      } catch (e) {
        setUser(null);
      } finally {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }
  return (
    <ThemeContext.Provider value={preferences}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider
          theme={theme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme}
        >
          <UserProvider defaultUser={user}>
            <AlertNotificationRoot
              colors={[
                {
                  label: "black",
                  card: "rgb(216,216,220)",
                  overlay: "#000000",
                  success: "rgb(52,199,85)",
                  danger: "rgb(255,59,48)",
                  warning: "rgb(255,149,0)",
                },
                {
                  label: "white",
                  card: "rgb(54,54,56)",
                  overlay: "#000000",
                  success: "rgb(48,209,88)",
                  danger: "rgb(255,69,58)",
                  warning: "rgb(255,159,10)",
                },
              ]}
            >
              <StatusBar style={theme === "dark" ? "light" : "dark"} />
              <Screens />
            </AlertNotificationRoot>
          </UserProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
}
