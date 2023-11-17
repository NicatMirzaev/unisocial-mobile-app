import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  InputToolbarProps,
  SendProps,
  ComposerProps,
  Composer,
  Send,
  MessageVideoProps,
  BubbleProps,
  Bubble,
  MessageProps,
} from "react-native-gifted-chat";
import {
  Appbar,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../context/theme";
import { useUser } from "../context/user";
import { useWebSocket } from "../context/ws";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { NavigationProp } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { fetchData } from "../lib/helpers";
import { BottomSheet, BottomSheetRef } from "react-native-sheet";
import EmojiPicker, { emojiFromUtf16 } from "rn-emoji-picker";
import { emojis } from "rn-emoji-picker/dist/data";
import { Emoji } from "rn-emoji-picker/dist/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReplyMessageBar from "../components/ui/ReplyMessageBar";
import ChatMessageBox from "../components/ui/ChatMessageBox";
import ReactionList from "../components/ui/ReactionList";

interface Props {
  navigation: NavigationProp<any, any>;
}

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

export default function Chat({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [emojiMessageId, setEmojiMessageId] = useState<any>(null);
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);
  const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
  const [showReactions, setShowReactions] = useState(null);
  const bottomSheet = useRef<BottomSheetRef>(null);
  const { user } = useUser();
  const { messages, setMessages, sendJsonMessage } = useWebSocket();
  const themeColors = useTheme();
  const { theme } = useThemeContext();

  const getMessages = (cursor: string | null = null) => {
    const query = cursor ? `?cursor=${cursor}` : "";
    return fetchData(`/messages${query}`);
  };

  const cursor = messages.length
    ? (messages[messages.length - 1] as any).messageId ||
      messages[messages.length - 1]._id
    : null;

  useEffect(() => {
    getMessages().then((data) => {
      if (data.success) {
        setMessages(data.data);
      }
    });

    AsyncStorage.getItem("recent_emojis").then((value) => {
      setRecentEmojis(value ? JSON.parse(value) : []);
    });
  }, []);

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: themeColors.colors.elevation.level5,
          marginHorizontal: 5,
          borderTopWidth: 0,
          flexDirection: replyMessage ? "column-reverse" : "row",
          alignItems: "center",
          borderRadius: 20,
        }}
      />
    );
  };

  const renderMessage = useCallback((props: MessageProps<IMessage>) => {
    return (
      <ChatMessageBox
        {...props}
        setReplyOnSwipe={setReplyMessage}
        clearReply={() => setReplyMessage(null)}
      />
    );
  }, []);

  const onSend = useCallback((message: IMessage[] = []) => {
    setMessages((prev: IMessage[]) => [
      ...prev,
      ...message.map((message) => ({ ...message, pending: true })),
    ]);
    sendJsonMessage({
      type: "message",
      data: { type: "text", message: message[0].text, tempId: message[0]._id },
    });
  }, []);

  const renderSend = useCallback((props: SendProps<IMessage>) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton icon="image" size={24} onPress={pickImage} />
        <Send {...props} sendButtonProps={{ style: { margin: 0 } }}>
          <IconButton icon={"send"} size={24} />
        </Send>
      </View>
    );
  }, []);

  const renderComposer = useCallback(
    (props: ComposerProps) => {
      return (
        <Composer
          {...props}
          textInputStyle={{ color: theme === "dark" ? "white" : "black" }}
        />
      );
    },
    [theme]
  );

  const renderVideo = useCallback((props: MessageVideoProps<IMessage>) => {
    return (
      <Video
        style={styles.video}
        source={{
          uri: props.currentMessage?.video as string,
        }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
      />
    );
  }, []);

  const renderAccessory = useCallback(() => {
    return replyMessage ? (
      <ReplyMessageBar
        message={replyMessage}
        clearReply={() => setReplyMessage(null)}
      />
    ) : null;
  }, [replyMessage]);

  const renderBubble = useCallback(
    (props: BubbleProps<IMessage>) => {
      const isLeft = props.currentMessage?.user._id === user?._id;
      const message = props.currentMessage as any;
      const reactions = Object.keys(message.reactions || {});

      return (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Bubble {...props} />
          {reactions.length ? (
            <TouchableOpacity
              style={{ paddingRight: !isLeft ? 60 : 0 }}
              onPress={() => setShowReactions(message.reactions || {})}
            >
              <Surface
                elevation={2}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  width: 35 * reactions.length,
                  height: 25,
                }}
              >
                {reactions.map((reaction) => (
                  <Text key={reaction}>{emojiFromUtf16(reaction)}</Text>
                ))}
                <Text style={{ marginLeft: 2 }}>
                  {Object.values(message.reactions).flat().length}
                </Text>
              </Surface>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    },
    [messages]
  );

  const sendMediaToServer = (media: ImagePicker.ImagePickerAsset) => {
    const msg = {
      _id: Math.random().toString(16).slice(2),
      createdAt: new Date(),
      user: {
        _id: user?._id,
        name: user?.fullName,
        avatar: user?.profileImg,
      },
      image: "",
      pending: true,
    };
    setMessages((prev: IMessage[]) => [...prev, msg]);
    FileSystem.readAsStringAsync(media.uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
      .then((base64Data) => {
        const message = {
          type: "message",
          data: {
            type: "media",
            base64: base64Data,
            contentType: media.type,
            tempId: msg._id,
          },
        };
        sendJsonMessage(message);
      })
      .catch((error) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: "ფოტო / ვიდეო ვერ გამოიგზავნა.",
        });
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      sendMediaToServer(asset);
    }
  };

  const loadMessages = () => {
    setLoading(true);
    getMessages(cursor)
      .then((data) => {
        if (data.success) {
          setMessages((prev: IMessage[]) => [...data.data, ...prev]);
        }
      })
      .finally(() => setLoading(false));
  };

  const onReaction = (emoji: Emoji) => {
    bottomSheet.current?.hide();
    sendJsonMessage({
      type: "reaction",
      data: { _id: emojiMessageId, emoji: emoji.unified },
    });
  };

  return (
    <View style={{ flex: 1, marginBottom: 10 }}>
      <Appbar.Header>
        <Appbar.Content title="ჩატი" />
      </Appbar.Header>
      {showReactions && (
        <ReactionList
          reactions={showReactions}
          onClose={() => setShowReactions(null)}
        />
      )}
      <BottomSheet
        height={HEIGHT / 1.5}
        ref={bottomSheet}
        colorScheme={theme as "light" | "dark"}
      >
        <EmojiPicker
          emojis={emojis}
          recent={recentEmojis}
          autoFocus={false}
          loading={false}
          darkMode={theme === "dark"}
          perLine={7}
          onSelect={onReaction}
          onChangeRecent={(recent) => {
            setRecentEmojis(recent),
              AsyncStorage.setItem("recent_emojis", JSON.stringify(recent));
          }}
        />
      </BottomSheet>
      <GiftedChat
        messages={messages.sort(
          (a, b) =>
            Date.parse(b.createdAt as any) - Date.parse(a.createdAt as any)
        )}
        scrollToBottom
        keyboardShouldPersistTaps="never"
        alwaysShowSend
        loadEarlier
        infiniteScroll
        shouldUpdateMessage={(props, nextProps) => {
          const prevMessage = props.currentMessage as any;
          const nextMessage = nextProps.currentMessage as any;
          if (prevMessage.update !== nextMessage.update) return true;

          return false;
        }}
        isLoadingEarlier={loading}
        onLoadEarlier={loadMessages}
        renderSend={renderSend}
        onPressAvatar={(user) =>
          navigation.navigate("Profile", { userId: user._id })
        }
        renderComposer={renderComposer}
        renderMessageVideo={renderVideo}
        renderBubble={renderBubble}
        renderAccessory={renderAccessory}
        renderMessage={renderMessage}
        messagesContainerStyle={{ paddingBottom: 10 }}
        renderUsernameOnMessage
        onSend={onSend}
        bottomOffset={Platform.OS === "ios" ? 150 : undefined}
        onLongPress={(_, message) => {
          setEmojiMessageId(message._id);
          bottomSheet.current?.show();
        }}
        renderInputToolbar={renderInputToolbar}
        user={{
          _id: user?._id as string,
          avatar: user?.profileImg,
          name: user?.fullName,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    alignSelf: "center",
    width: WIDTH / 2,
    height: WIDTH / 2,
    borderRadius: 15,
    marginBottom: 5,
  },
});
