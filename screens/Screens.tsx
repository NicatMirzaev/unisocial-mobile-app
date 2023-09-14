import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { NavigationContainer } from "@react-navigation/native";
import { useUser } from "../context/user";
import HomeScreen from "./Home";
import LoginScreen from "./auth/Login";
import RegisterScreen from "./auth/Register";
import EmailVerification from "./auth/EmailVerification";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Screens() {
  const { user } = useUser();
  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "white" },
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
