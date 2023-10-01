import { NavigationProp } from "@react-navigation/native";
import { Appbar } from "react-native-paper";
import { RootStackParamList, User } from "../types";
import UserProfile from "../components/Profile";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function Profile({ route, navigation }: Props) {
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar.Header>
      <UserProfile userId={route.params.userId} navigation={navigation} />
    </>
  );
}
