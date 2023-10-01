import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { NavigationContainer } from "@react-navigation/native";
import { useUser } from "../context/user";
import LoginScreen from "./auth/Login";
import RegisterScreen from "./auth/Register";
import EmailVerification from "./auth/EmailVerification";
import Main from "./Main";
import { CombinedDarkTheme, CombinedDefaultTheme } from "../themes";
import { useThemeContext } from "../context/theme";
import { ImagesView } from "./ImagesView";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Screens() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const { user } = useUser();
  const { theme } = useThemeContext();

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        setToken(token || "");
      } catch (error) {
        setToken("");
      }
    };

    if (user) {
      getToken();
    }
  }, [user]);

  return (
    <NavigationContainer
      theme={theme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme}
    >
      {user && token !== undefined ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Main"
            component={Main}
            initialParams={{ token }}
          />
          <Stack.Screen
            name="ImagesView"
            component={ImagesView}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      ) : !user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerification}
            initialParams={{ email: "" }}
          />
        </Stack.Navigator>
      ) : null}
    </NavigationContainer>
  );
}
