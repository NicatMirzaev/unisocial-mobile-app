import {
  VirtualizedList,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Appbar, Button, Searchbar, Surface, Text } from "react-native-paper";
import UserAvatar from "../components/ui/UserAvatar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useWebSocket } from "../context/ws";
import { NavigationProp, useIsFocused } from "@react-navigation/native";
import { User } from "../types";

interface Props {
  navigation: NavigationProp<any, any>;
}

export default function Students({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const { nearbyUsers, sendJsonMessage } = useWebSocket();

  const getNearbyUsers = () => {
    sendJsonMessage({ type: "nearbyUsers" });
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return nearbyUsers;
    return nearbyUsers.filter((item: User) =>
      item.fullName.includes(searchQuery)
    );
  }, [searchQuery, nearbyUsers]);

  useEffect(() => {
    getNearbyUsers();
    const interval = setInterval(() => {
      getNearbyUsers();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isFocused]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={`სტუდენტები (${filtered.length})`} />
      </Appbar.Header>
      <Searchbar
        placeholder="ძებნა"
        onChangeText={onChangeSearch}
        value={searchQuery}
      />
      <VirtualizedList
        style={{ marginTop: 10 }}
        initialNumToRender={4}
        data={filtered}
        renderItem={({ item }: { item: User }) => (
          <Surface style={styles.surface} elevation={1}>
            <TouchableOpacity
              style={styles.profileContainer}
              onPress={() =>
                navigation.navigate("Profile", { userId: item._id })
              }
            >
              <View>
                <UserAvatar
                  imgSource={item.profileImg}
                  fullName={item?.fullName || "UF"}
                  size={48}
                />
              </View>
              <View style={styles.profileDetails}>
                <Text variant="titleMedium">{item?.fullName}</Text>
                <View style={styles.education}>
                  <Icon name="town-hall" size={18} color={"#C5C6D0"} />
                  <Text variant="labelSmall">
                    თბილისის სახელმწიფო უნივერსიტეტი
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Surface>
        )}
        keyExtractor={(item) => item._id}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 10,
    margin: 5,
  },
  profileContainer: {
    flexDirection: "row",
    gap: 15,
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  profileDetails: {
    flex: 1,
    gap: 5,
  },
  education: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 10,
  },
});
