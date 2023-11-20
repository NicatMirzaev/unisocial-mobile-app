import { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation } from "react-native-paper";
import * as Location from "expo-location";
import Chat from "./Chat";
import Students from "./Students";
import MyProfile from "./MyProfile";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CommonActions } from "@react-navigation/native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import useWebSocket from "react-native-use-websocket";
import { WebSocketContext } from "../context/ws";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { IMessage } from "react-native-gifted-chat";
import { useUser } from "../context/user";
import { ungroup } from "../lib/helpers";

const Tab = createBottomTabNavigator();

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export default function Main({ route }: Props) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { sendJsonMessage } = useWebSocket(
    process.env.EXPO_PUBLIC_WS_URL as string,
    {
      onOpen: () =>
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "შეტყობინება",
          textBody: "სერვერთან კავშირი წარმატებულია!",
        }),

      onError: () =>
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეტყობინება",
          textBody:
            "სერვერთან კავშირი ვერ მოხდა, გთხოვთ გადაამოწმოთ ინტერნეტთან კავშირი.",
        }),

      onMessage(event) {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "nearbyUsers": {
              setNearbyUsers(data.data);
              break;
            }
            case "message": {
              console.log(data.data);
              if (data.data.tempId) {
                setMessages((prev) => {
                  const temp = [...prev];
                  if (temp.length >= 50) {
                    temp.pop();
                  }
                  const index = temp.findIndex(
                    (item) => item._id === data.data.tempId
                  );

                  if (index != -1) {
                    temp[index] = {
                      ...data.data,
                      createdAt: temp[index].createdAt,
                    };
                  }
                  return temp;
                });
              } else {
                setMessages((prev) => {
                  const temp = [...prev];
                  if (temp.length >= 50) {
                    temp.pop();
                  }
                  return [...prev, data.data];
                });
              }
              break;
            }
            case "reaction": {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message._id === data.data._id)
                    return {
                      ...message,
                      update: ((message as any).update || 1) + 1,
                      reactions: data.data.reactions,
                    };

                  return message;
                })
              );
              break;
            }
          }
        } catch {}
      },

      shouldReconnect: (closeEvent) => true,
      options: {
        headers: {
          authorization: `Bearer ${route.params.token}`,
        },
      },
    }
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      let location = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 3000,
        },
        (newLocation) => {
          sendJsonMessage({
            type: "updateLocation",
            data: {
              lat: newLocation.coords.latitude,
              long: newLocation.coords.longitude,
            },
          });
        }
      );
    })();
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        nearbyUsers,
        messages,
        setMessages,
        sendJsonMessage,
      }}
    >
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            onTabPress={({ route, preventDefault }) => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (event.defaultPrevented) {
                preventDefault();
              } else {
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            }}
            renderIcon={({ route, focused, color }) => {
              const { options } = descriptors[route.key];
              if (options.tabBarIcon) {
                return options.tabBarIcon({ focused, color, size: 24 });
              }

              return null;
            }}
            getLabelText={({ route }) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : (route as any).title;

              return label;
            }}
          />
        )}
      >
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            tabBarLabel: "ჩატი",
            tabBarIcon: ({ color, size }) => {
              return <Icon name="chat" size={size} color={color} />;
            },
          }}
        />
        <Tab.Screen
          name="Students"
          component={Students}
          options={{
            tabBarLabel: "სტუდენტები",
            tabBarIcon: ({ color, size }) => {
              return <Icon name="account-group" size={size} color={color} />;
            },
          }}
        />
        <Tab.Screen
          name="MyProfile"
          component={MyProfile}
          options={{
            tabBarLabel: "პროფილი",
            tabBarIcon: ({ color, size }) => {
              return <Icon name="account" size={size} color={color} />;
            },
          }}
        />
      </Tab.Navigator>
    </WebSocketContext.Provider>
  );
}
