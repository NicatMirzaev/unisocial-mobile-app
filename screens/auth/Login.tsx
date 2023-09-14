import * as SecureStore from "expo-secure-store";
import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import {
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  View,
} from "react-native";
import { Button, DefaultTheme, Text, TextInput } from "react-native-paper";
import { fetchData } from "../../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useUser } from "../../context/user";

type Props = {
  navigation: NavigationProp<any, any>;
};

const LoginScreen = ({ navigation }: Props) => {
  const { setUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    setSubmitting(true);
    fetchData("/auth/login", { email, password }, "POST", false)
      .then((data) => {
        if (data.success) {
          SecureStore.setItemAsync("token", data.token);
          setUser(data.user);
        }
      })
      .catch((err) => {
        const { data, status } = err;
        if (status == 401) {
          navigation.navigate("EmailVerification", { email });
        } else {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "შეცდომა",
            textBody: data.message,
          });
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.container}>
        <Text
          variant="headlineLarge"
          style={{ textAlign: "center", fontWeight: "bold" }}
        >
          გამარჯობა!
        </Text>

        <Text
          variant="bodySmall"
          style={{ textAlign: "center", color: "rgb(100 116 139)" }}
        >
          გთხოვთ შეიყვანოთ ელ.ფოსტა და პაროლი.
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

        <TextInput
          label="პაროლი"
          returnKeyType="done"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <View style={styles.forgotPassword}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.label}>დაგავიწყდა პაროლი?</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          disabled={
            !email.trim().length || !password.trim().length || submitting
          }
          loading={submitting}
          onPress={onSubmit}
        >
          შესვლა
        </Button>

        <View style={styles.row}>
          <Text style={styles.label}>არ ხართ დარეგისტრირებული? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>რეგისტრაცია</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    gap: 20,
  },
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  label: {
    color: DefaultTheme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: DefaultTheme.colors.primary,
  },
});

export default LoginScreen;
