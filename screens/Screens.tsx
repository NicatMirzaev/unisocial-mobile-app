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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Screens() {
  const { user } = useUser();
  const { theme } = useThemeContext();

  return (
    <NavigationContainer
      theme={theme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme}
    >
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={Main} />
        </Stack.Navigator>
      ) : (
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
      )}
    </NavigationContainer>
  );
}
