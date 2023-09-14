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

type Props = {
  navigation: NavigationProp<any, any>;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (key: string, value: string) => {
    setValues({ ...values, [key]: value });
  };

  const onSubmit = () => {
    setSubmitting(true);
    fetchData("/auth/register", { ...values }, "POST", false)
      .then((data) => {
        if (data.success) {
          navigation.navigate("EmailVerification", { email: values.email });
        }
      })
      .catch(({ data }) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: data.message,
        });
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
          რეგისტრაცია
        </Text>

        <Text
          variant="bodySmall"
          style={{ textAlign: "center", color: "rgb(100 116 139)" }}
        >
          გთხოვთ შეავსოთ მოცემული ველები
        </Text>

        <TextInput
          label="სახელი და გვარი"
          returnKeyType="next"
          value={values.fullName}
          onChangeText={(text) => handleChange("fullName", text)}
        />

        <TextInput
          label="ელ.ფოსტა"
          returnKeyType="next"
          value={values.email}
          onChangeText={(text) => handleChange("email", text)}
          autoCapitalize="none"
          textContentType="emailAddress"
          keyboardType="email-address"
        />

        <TextInput
          label="პაროლი"
          returnKeyType="done"
          value={values.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={submitting}
          disabled={Object.values(values).some((value) => !value) || submitting}
        >
          რეგისტრაცია
        </Button>

        <View style={styles.row}>
          <Text style={styles.label}>უკვე ხართ დარეგისტრირებული? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>შესვლა</Text>
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

export default RegisterScreen;
