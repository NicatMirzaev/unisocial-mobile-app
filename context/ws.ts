import { createContext, useContext } from "react";
import { User } from "../types";
import { IMessage } from "react-native-gifted-chat";

export const WebSocketContext = createContext<{
  nearbyUsers: User[];
  messages: IMessage[];
  setMessages: (data: any) => void;
  sendJsonMessage: (data: any) => void;
}>({
  nearbyUsers: [],
  messages: [],
  setMessages: () => {},
  sendJsonMessage: (data: any) => {},
});

export const useWebSocket = () => useContext(WebSocketContext);
