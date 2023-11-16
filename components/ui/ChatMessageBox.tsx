import { View, StyleSheet, Animated } from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { IMessage, Message, MessageProps } from "react-native-gifted-chat";
import { isSameDay, isSameUser } from "react-native-gifted-chat/lib/utils";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type ChatMessageBoxProps = {
  setReplyOnSwipe: (message: IMessage) => void;
  clearReply: () => void;
} & MessageProps<IMessage>;

const ChatMessageBox = ({
  setReplyOnSwipe,
  clearReply,
  ...props
}: ChatMessageBoxProps) => {
  const isNextMyMessage =
    props.currentMessage &&
    props.nextMessage &&
    isSameUser(props.currentMessage, props.nextMessage) &&
    isSameDay(props.currentMessage, props.nextMessage);

  const renderRightAction = (
    progressAnimatedValue: Animated.AnimatedInterpolation<any>
  ) => {
    const size = progressAnimatedValue.interpolate({
      inputRange: [0, 1, 100],
      outputRange: [0, 1, 1],
    });
    const trans = progressAnimatedValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, -12, -20],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: size }, { translateX: trans }] },
          isNextMyMessage
            ? styles.defaultBottomOffset
            : styles.bottomOffsetNext,
          props.position === "right" && styles.leftOffsetValue,
        ]}
      >
        <View style={styles.replyImageWrapper}>
          <Icon name="reply" size={24} color={"#4267B2"} />
        </View>
      </Animated.View>
    );
  };

  const onSwipeOpenAction = () => {
    if (props.currentMessage) {
      setReplyOnSwipe({ ...props.currentMessage });
    }
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightAction}
        onSwipeableOpen={onSwipeOpenAction}
        onSwipeableClose={clearReply}
      >
        <Message {...props} />
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
  },
  replyImageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  replyImage: {
    width: 20,
    height: 20,
  },
  defaultBottomOffset: {
    marginBottom: 2,
  },
  bottomOffsetNext: {
    marginBottom: 10,
  },
  leftOffsetValue: {
    marginLeft: 16,
  },
});

export default ChatMessageBox;
