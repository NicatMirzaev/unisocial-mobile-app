import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { IconButton, Modal, Portal, Text, useTheme } from "react-native-paper";
import UserAvatar from "./UserAvatar";
import { emojiFromUtf16 } from "rn-emoji-picker";
import { FlatList } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useThemeContext } from "../../context/theme";

const { width, height } = Dimensions.get("window");

export default function ReactionList({
  reactions,
  onClose,
}: {
  reactions: { [key: string]: any[] };
  onClose: () => void;
}) {
  const { theme } = useThemeContext();
  const themeSettings = useTheme();
  const reacts = useMemo(() => {
    const data: any[] = [];

    Object.values(reactions).forEach((item) =>
      item.map((reaction) => data.push(reaction))
    );

    return data;
  }, [reactions]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
          }}
        >
          <UserAvatar
            imgSource={item.user.profileImg as string}
            fullName={item.user.fullName || "UF"}
            size={50}
          />
          <Text>{item.user.fullName}</Text>
        </View>
        <Text variant="headlineSmall">{emojiFromUtf16(item.emoji)}</Text>
      </View>
    );
  };
  return (
    <Portal>
      <Modal
        visible
        contentContainerStyle={{
          backgroundColor: themeSettings.colors.background,
          padding: 20,
          borderRadius: 10,
          width: width,
          height: height / 2,
          flexDirection: "column",
        }}
        style={{ marginTop: height / 1.7, marginVertical: "auto" }}
        onDismiss={onClose}
      >
        <View
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text variant="titleMedium">რეაქციები</Text>
          <TouchableOpacity style={{ marginRight: 4 }} onPress={onClose}>
            <Icon
              name="close-circle"
              size={24}
              color={theme == "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={reacts}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.user._id + index.toString()}
        />
      </Modal>
    </Portal>
  );
}
