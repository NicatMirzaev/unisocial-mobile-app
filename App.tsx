import * as SplashScreen from "expo-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { AlertNotificationRoot } from "react-native-alert-notification";
import Screens from "./screens/Screens";
import UserProvider from "./context/user";
import { useEffect, useState } from "react";
import { fetchData } from "./lib/helpers";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
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
    <PaperProvider>
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
          <StatusBar style="auto" />
          <Screens />
        </AlertNotificationRoot>
      </UserProvider>
    </PaperProvider>
  );
}
