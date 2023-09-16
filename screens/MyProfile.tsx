import { Image } from "expo-image";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Divider, IconButton, Surface, Text } from "react-native-paper";
import UserAvatar from "../components/ui/UserAvatar";
import { useUser } from "../context/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { fetchData } from "../lib/helpers";
import { Photo } from "../types";
import { NavigationProp } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

type Props = {
  navigation: NavigationProp<any, any>;
};

export default function MyProfile({ navigation }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (user?._id) {
      fetchData(`/photos/${user?._id}`)
        .then((data) => {
          if (data.success) {
            setPhotos(data.data);
          }
        })
        .catch(() => setPhotos([]));
    } else {
      setPhotos([]);
    }
  }, [user]);
  return (
    <>
      <Appbar.Header>
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: "flex-start", justifyContent: "flex-start" },
          ]}
          pointerEvents="box-none"
        >
          <Appbar.Content
            title="პროფილი"
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 15,
            }}
          />
        </View>
        <View style={{ flex: 1 }} />
        <Appbar.Action icon="account-edit" onPress={() => {}} />
        <Appbar.Action icon="cog" onPress={() => {}} />
      </Appbar.Header>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} scrollEnabled={false}>
          <Surface style={styles.surface} elevation={3}>
            <View style={styles.profileContainer}>
              <UserAvatar imgSource={""} fullName={user?.fullName || "UF"} />
              <View style={styles.profileDetails}>
                <Text variant="titleMedium">{user?.fullName}</Text>
                <View style={styles.education}>
                  <Icon name="town-hall" size={18} color={"#C5C6D0"} />
                  <Text variant="labelSmall">
                    თბილისის სახელმწიფო უნივერსიტეტი
                  </Text>
                </View>
                <View style={styles.education}>
                  <Icon name="briefcase" size={18} color={"#C5C6D0"} />
                  <Text variant="labelSmall">კომპიუტერული მეცნიერება</Text>
                </View>
              </View>
            </View>
          </Surface>
          <View style={styles.photosHeader}>
            <Text variant="titleSmall" style={{ paddingLeft: 10 }}>
              ფოტოები ({photos.length})
            </Text>
            <IconButton icon={"plus"} size={24} />
          </View>
          <Divider />
        </ScrollView>
        {photos.length > 0 ? (
          <FlatList
            style={{ width, height: height / 3, padding: 8 }}
            data={photos}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item._id}
                onPress={() =>
                  navigation.navigate("ImagesView", { index, images: photos })
                }
              >
                <Image
                  style={{ height: 120, width: width / 3, flex: 1 }}
                  source={{
                    uri: item.url,
                  }}
                />
              </TouchableOpacity>
            )}
            numColumns={3}
            keyExtractor={(item) => item._id}
          />
        ) : (
          <>
            <Image
              source={require("../assets/no-photos.png")}
              style={{
                width: 164,
                height: 164,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <Text variant="titleMedium" style={{ textAlign: "center" }}>
              ფოტოები არ მოიძებნა.
            </Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  surface: {
    flex: 1,
    borderRadius: 10,
  },
  profileContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  photosHeader: {
    flex: 1,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
