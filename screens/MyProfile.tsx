import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Divider,
  IconButton,
  Portal,
  Surface,
  Text,
} from "react-native-paper";
import UserAvatar from "../components/ui/UserAvatar";
import { useUser } from "../context/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { fetchData } from "../lib/helpers";
import { Photo, User } from "../types";
import { NavigationProp } from "@react-navigation/native";
import { EditProfile } from "../components/modals/EditProfile";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

const { width, height } = Dimensions.get("window");

type Props = {
  navigation: NavigationProp<any, any>;
};

export default function MyProfile({ navigation }: Props) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
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

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    const data = new FormData();
    // @ts-ignore
    data.append("image", {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.type,
    });

    const token = await SecureStore.getItemAsync("token");
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch(process.env.EXPO_PUBLIC_API_URL + "/photos/upload", {
      method: "POST",
      headers,
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        setUploading(false);
        if (data.success) {
          const temp = [...photos];
          temp.unshift(data.data);
          setPhotos(temp);
        } else {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "შეცდომა",
            textBody: data.message,
          });
        }
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      uploadImage(asset);
    }
  };

  return (
    <>
      {showEditModal && (
        <EditProfile
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          user={user as User}
        />
      )}
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
        <Appbar.Action
          icon="account-edit"
          onPress={() => setShowEditModal(true)}
        />
        <Appbar.Action icon="cog" onPress={() => {}} />
      </Appbar.Header>
      <View style={styles.container}>
        {uploading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View>
          <Surface style={styles.surface} elevation={3}>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ImagesView", {
                    index: 0,
                    images: user?.profileImg
                      ? [{ _id: user._id, url: user.profileImg }, ...photos]
                      : photos,
                  });
                }}
              >
                <UserAvatar
                  imgSource={user?.profileImg as string}
                  fullName={user?.fullName || "UF"}
                />
              </TouchableOpacity>
              <View style={styles.profileDetails}>
                <Text variant="titleMedium">{user?.fullName}</Text>
                <View style={styles.education}>
                  <Icon name="town-hall" size={18} color={"#C5C6D0"} />
                  <Text variant="labelSmall">
                    თბილისის სახელმწიფო უნივერსიტეტი
                  </Text>
                </View>
                {user?.program && (
                  <View style={styles.education}>
                    <Icon name="briefcase" size={18} color={"#C5C6D0"} />
                    <Text variant="labelSmall">{user.program}</Text>
                  </View>
                )}
              </View>
            </View>
          </Surface>
          <View style={styles.photosHeader}>
            <Text variant="titleSmall" style={{ paddingLeft: 10 }}>
              ფოტოები ({photos.length})
            </Text>
            <IconButton icon={"plus"} size={24} onPress={pickImage} />
          </View>
          <Divider />
          {photos.length > 0 ? (
            <FlatList
              style={{ width, height: height / 3, padding: 8 }}
              data={photos}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() =>
                    navigation.navigate("ImagesView", {
                      index: index + 1,
                      images: user?.profileImg
                        ? [{ _id: user._id, url: user.profileImg }, ...photos]
                        : photos,
                    })
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
    marginBottom: 20,
    borderRadius: 10,
  },
  profileContainer: {
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
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
