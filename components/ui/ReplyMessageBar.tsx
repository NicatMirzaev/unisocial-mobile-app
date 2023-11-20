import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const replyMessageBarHeight = 50;

type ReplyMessageBarProps = {
  clearReply: () => void;
  message: { text: string };
};

const ReplyMessageBar = ({ clearReply, message }: ReplyMessageBarProps) => {
  const croppedText = useMemo(() => {
    if (message.text === undefined) {
      return "ფოტო / ვიდეო";
    }
    if (message.text.length > 30) {
      return message.text.substring(0, 30) + "...";
    }

    return message.text;
  }, [message]);
  return (
    <View style={styles.container}>
      <View style={styles.replyImageContainer}>
        <Icon name="reply" size={20} />
      </View>

      <View style={styles.messageContainer}>
        <Text>{croppedText}</Text>
      </View>

      <IconButton icon={"close-circle"} size={24} onPress={clearReply} />
    </View>
  );
};

export default ReplyMessageBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 0.2,
    borderBottomColor: "gray",
    height: replyMessageBarHeight,
  },
  replyImageContainer: {
    paddingLeft: 8,
    paddingRight: 6,
    borderRightWidth: 2,
    borderRightColor: "#2196F3",
    marginRight: 6,
    height: "100%",
    justifyContent: "center",
  },
  crossButton: {
    padding: 4,
  },
  messageContainer: {
    flex: 1,
  },
});
