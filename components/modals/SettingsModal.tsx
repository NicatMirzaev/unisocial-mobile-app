import {
  Modal,
  Portal,
  Switch,
  Button,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useThemeContext } from "../../context/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMemo, useState } from "react";
import { fetchData } from "../../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useUser } from "../../context/user";

interface Props {
  onDismiss: () => void;
}

export const SettingsModal = ({ onDismiss }: Props) => {
  const { setUser } = useUser();
  const [mode, setMode] = useState("main");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const { theme, toggleTheme } = useThemeContext();
  const themeSettings = useTheme();

  const handleChange = (key: string, value: any) => {
    setValues({ ...values, [key]: value });
  };

  const handleSubmit = () => {
    setSubmitting(true);

    fetchData("/users/change-password", { ...values }, "POST")
      .then((data) => {
        if (data.success) {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "შეტყობინება",
            textBody: data.message,
          });
          setMode("main");
          setValues({
            currentPassword: "",
            newPassword: "",
          });
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

  const logout = () => {
    setUser(null);
    SecureStore.deleteItemAsync("token");
  };

  const renderContent = useMemo(() => {
    if (mode === "changePassword") {
      return (
        <View
          style={{
            width: "100%",
            gap: 10,
            marginTop: 20,
            flexDirection: "column",
          }}
        >
          <TextInput
            label="ძველი პაროლი"
            returnKeyType="next"
            value={values.currentPassword}
            secureTextEntry
            onChangeText={(text) => handleChange("currentPassword", text)}
          />
          <TextInput
            label="ახალი პაროლი"
            returnKeyType="done"
            value={values.newPassword}
            secureTextEntry
            onChangeText={(text) => handleChange("newPassword", text)}
          />
          <Button
            mode="elevated"
            style={{ marginTop: 5 }}
            disabled={
              submitting || !values.currentPassword || !values.newPassword
            }
            loading={submitting}
            onPress={handleSubmit}
          >
            შეცვლა
          </Button>
        </View>
      );
    }
    return (
      <>
        <View style={styles.option}>
          <Text variant="labelMedium">მუქი თემა</Text>
          <Switch
            color={"red"}
            value={theme === "dark"}
            onValueChange={toggleTheme}
          />
        </View>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setMode("changePassword")}
        >
          <Text variant="labelMedium">პაროლის შეცვლა</Text>
          <Icon
            name="lock"
            size={24}
            color={theme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={logout}>
          <Text variant="labelMedium">გასვლა</Text>
          <Icon
            name="logout"
            size={24}
            color={theme === "dark" ? "white" : "black"}
          />
        </TouchableOpacity>
      </>
    );
  }, [mode, theme, values, submitting]);

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: themeSettings.colors.background,
          padding: 20,
          flexDirection: "column",
        }}
        style={{ padding: 10, marginBottom: 100 }}
      >
        {renderContent}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
