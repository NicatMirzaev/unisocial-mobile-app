import { createContext, useContext } from "react";

export const WebSocketContext = createContext({
  nearbyUsers: [],
  sendJsonMessage: (data: any) => {},
});

export const useWebSocket = () => useContext(WebSocketContext);
