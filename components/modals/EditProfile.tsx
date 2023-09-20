import { Button, Modal, Portal, TextInput, useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { View, StyleSheet } from "react-native";
import { User } from "../../types";
import UserAvatar from "../ui/UserAvatar";
import { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { fetchData } from "../../lib/helpers";
import { useUser } from "../../context/user";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  user: User;
}

export const EditProfile = ({ onDismiss, user }: Props) => {
  const { setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    profileImg: { uri: "" },
    fullName: "",
    program: "",
  });
  const theme = useTheme();

  useEffect(() => {
    setValues({
      profileImg: { uri: user.profileImg },
      fullName: user.fullName,
      program: user.program,
    });
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      handleChange("profileImg", {
        uri: asset.uri,
        name: asset.fileName,
        type: asset.type,
      });
    }
  };

  const handleChange = (key: string, value: any) => {
    setValues({ ...values, [key]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const data = new FormData();
    if (values.profileImg.uri !== user.profileImg) {
      // @ts-ignore
      data.append("file", {
        ...values.profileImg,
      });
    }

    data.append("fullName", values.fullName);
    data.append("program", values.program);

    const token = await SecureStore.getItemAsync("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch(process.env.EXPO_PUBLIC_API_URL + "/users/update", {
      method: "POST",
      headers,
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "შეტყობინება",
            textBody: data.message,
          });
          onDismiss();
        } else {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "შეცდომა",
            textBody: data.message,
          });
        }
        setSubmitting(false);
      });
  };
  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          padding: 20,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
        style={{ padding: 10, marginBottom: 100 }}
      >
        <TouchableOpacity style={{ position: "relative" }} onPress={pickImage}>
          <UserAvatar
            imgSource={values.profileImg.uri}
            fullName={user.fullName}
            size={80}
          />
          <Icon
            name="camera-plus"
            size={20}
            color="green"
            style={{ position: "absolute", bottom: 0, right: 0 }}
          />
        </TouchableOpacity>
        <View
          style={{
            width: "100%",
            gap: 10,
            marginTop: 20,
            flexDirection: "column",
          }}
        >
          <TextInput
            label="სახელი და გვარი"
            returnKeyType="next"
            value={values.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
          />
          <TextInput
            label="პროგრამა"
            returnKeyType="done"
            value={values.program}
            onChangeText={(text) => handleChange("program", text)}
          />
          <Button
            mode="elevated"
            style={{ marginTop: 5 }}
            onPress={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            შენახვა
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
