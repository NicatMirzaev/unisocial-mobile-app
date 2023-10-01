import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import { useUser } from "../context/user";
import { useState } from "react";
import { User } from "../types";
import { NavigationProp } from "@react-navigation/native";
import { EditProfile } from "../components/modals/EditProfile";
import { SettingsModal } from "../components/modals/SettingsModal";
import UserProfile from "../components/Profile";

type Props = {
  navigation: NavigationProp<any, any>;
};

export default function MyProfile({ navigation }: Props) {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const { user } = useUser();

  return (
    <>
      {showEditModal && (
        <EditProfile
          onDismiss={() => setShowEditModal(false)}
          user={user as User}
        />
      )}
      {showSettingModal && (
        <SettingsModal onDismiss={() => setShowSettingModal(false)} />
      )}
      <Appbar.Header>
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: "flex-start", justifyContent: "flex-start" },
          ]}
          pointerEvents="box-none"
        >
          <Appbar.Content
            title="პროფილი"
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 15,
            }}
          />
        </View>
        <View style={{ flex: 1 }} />
        <Appbar.Action
          icon="account-edit"
          onPress={() => setShowEditModal(true)}
        />
        <Appbar.Action icon="cog" onPress={() => setShowSettingModal(true)} />
      </Appbar.Header>
      <UserProfile
        userId={user?._id as string}
        data={user as User}
        navigation={navigation}
      />
    </>
  );
}
