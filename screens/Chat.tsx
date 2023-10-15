import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
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
} from "react-native-gifted-chat";
import { Appbar, IconButton, useTheme } from "react-native-paper";
import { useThemeContext } from "../context/theme";
import { useUser } from "../context/user";
import { useWebSocket } from "../context/ws";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { NavigationProp } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { fetchData } from "../lib/helpers";

interface Props {
  navigation: NavigationProp<any, any>;
}

export default function Chat({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
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
  }, []);

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: themeColors.colors.elevation.level5,
          marginHorizontal: 5,
          borderTopWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 20,
        }}
      />
    );
  };

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
        console.log(data.data);
        if (data.success) {
          setMessages((prev: IMessage[]) => [...data.data, ...prev]);
        }
      })
      .finally(() => setLoading(false));
  };

  console.log(cursor);

  return (
    <View style={{ flex: 1, marginBottom: 10 }}>
      <Appbar.Header>
        <Appbar.Content title="ჩატი" />
      </Appbar.Header>
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
        isLoadingEarlier={loading}
        onLoadEarlier={loadMessages}
        renderSend={renderSend}
        onPressAvatar={(user) =>
          navigation.navigate("Profile", { userId: user._id })
        }
        renderComposer={renderComposer}
        renderMessageVideo={renderVideo}
        messagesContainerStyle={{ paddingBottom: 10 }}
        renderUsernameOnMessage
        onSend={onSend}
        bottomOffset={Platform.OS === "ios" ? 110 : undefined}
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
    width: Dimensions.get("window").width / 2,
    height: Dimensions.get("window").width / 2,
    borderRadius: 15,
    marginBottom: 5,
  },
});
