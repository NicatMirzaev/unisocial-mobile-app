import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import {
  GiftedChat,
  IMessage,
  InputToolbar,
  InputToolbarProps,
  SendProps,
  ComposerProps,
  Composer,
  Send,
} from "react-native-gifted-chat";
import { Appbar, IconButton, useTheme } from "react-native-paper";
import { useThemeContext } from "../context/theme";
import { useUser } from "../context/user";
import { useWebSocket } from "../context/ws";

export default function Chat() {
  const { user } = useUser();
  const { messages, sendJsonMessage } = useWebSocket();
  const themeColors = useTheme();
  const { theme } = useThemeContext();

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
    sendJsonMessage({ type: "message", data: message[0].text });
  }, []);

  const renderSend = useCallback((props: SendProps<IMessage>) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton icon="image" size={24} onPress={() => {}} />
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
        renderSend={renderSend}
        renderComposer={renderComposer}
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
