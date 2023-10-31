import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import { fetchData } from "../../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "NewPassword">;

export default function NewPassword({ navigation, route }: Props) {
  const { token } = route.params;
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = () => {
    setLoading(true);

    fetchData(
      "/auth/reset-password",
      { token, newPassword, confirmPassword },
      "PUT",
      false
    )
      .then((data) => {
        if (data.success) {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "შეტყობინება",
            textBody: data.message,
          });

          navigation.navigate("Login");
        }
      })
      .catch(({ data }) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: data.message,
        });
      })
      .finally(() => setLoading(false));
  };
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate("Login")} />
        <Appbar.Content title="ახალი პაროლი" />
      </Appbar.Header>
      <KeyboardAvoidingView style={{ padding: 10, flex: 1 }}>
        <Text
          variant="bodySmall"
          style={{
            textAlign: "center",
            marginVertical: 20,
            color: "rgb(100 116 139)",
          }}
        >
          გთხოვთ შეიყვანოთ ახალი პაროლი.
        </Text>

        <TextInput
          label="ახალი პაროლი"
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          secureTextEntry
        />

        <TextInput
          label="ახალი პაროლი განმეორებით"
          returnKeyType="done"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
        />

        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          disabled={
            !newPassword.trim().length ||
            loading ||
            newPassword !== confirmPassword
          }
          loading={loading}
          onPress={onSubmit}
        >
          გაგრძელება
        </Button>
      </KeyboardAvoidingView>
    </>
  );
}
