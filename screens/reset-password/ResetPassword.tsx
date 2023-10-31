import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import { fetchData } from "../../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

type Props = {
  navigation: NavigationProp<any, any>;
};

export default function ResetPassword({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = () => {
    setLoading(true);

    fetchData("/auth/reset-password", { email }, "POST", false)
      .then((data) => {
        if (data.success) {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "შეტყობინება",
            textBody: data.message,
          });

          navigation.navigate("ResetPasswordVerification", { email });
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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="პაროლის აღდგენა" />
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
          გთხოვთ შეიყვანოთ ელ.ფოსტა რომლითაც ხართ დარეგისტრირებული.
        </Text>

        <TextInput
          label="ელ.ფოსტა"
          returnKeyType="next"
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          textContentType="emailAddress"
          keyboardType="email-address"
        />

        <Button
          mode="contained"
          style={{ marginTop: 20 }}
          disabled={!email.trim().length || loading}
          loading={loading}
          onPress={onSubmit}
        >
          გაგრძელება
        </Button>
      </KeyboardAvoidingView>
    </>
  );
}
