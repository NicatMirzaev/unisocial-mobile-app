import { createContext, useContext } from "react";
import { User } from "../types";
import { IMessage } from "react-native-gifted-chat";

export const WebSocketContext = createContext<{
  nearbyUsers: User[];
  messages: IMessage[];
  sendJsonMessage: (data: any) => void;
}>({
  nearbyUsers: [],
  messages: [],
  sendJsonMessage: (data: any) => {},
});

export const useWebSocket = () => useContext(WebSocketContext);
