import {
  RouteProp,
  useNavigation,
  useRoute,
  useIsFocused,
  NavigationProp,
} from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import AwesomeGallery, {
  GalleryRef,
  RenderItemInfo,
} from "react-native-awesome-gallery";
import * as React from "react";
import { RootStackParamList } from "../types";
import { Image } from "expo-image";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dialog, IconButton, Text, Portal, Button } from "react-native-paper";
import { fetchData } from "../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useUser } from "../context/user";

const renderItem = ({
  item,
  setImageDimensions,
}: RenderItemInfo<{ uri: string }>) => {
  return (
    <Image
      source={item.uri}
      style={StyleSheet.absoluteFillObject}
      contentFit="contain"
      onLoad={(e) => {
        const { width, height } = e.source;
        setImageDimensions({ width, height });
      }}
    />
  );
};

export const ImagesView = () => {
  const { user, setUser } = useUser();
  const { top, bottom } = useSafeAreaInsets();
  const { setParams, goBack } =
    useNavigation<NavigationProp<RootStackParamList, "ImagesView">>();
  const isFocused = useIsFocused();
  const { params } = useRoute<RouteProp<RootStackParamList, "ImagesView">>();
  const gallery = useRef<GalleryRef>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [infoVisible, setInfoVisible] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle(isFocused ? "light-content" : "dark-content", true);
    if (!isFocused) {
      StatusBar.setHidden(false, "fade");
    }
  }, [isFocused]);

  const onIndexChange = useCallback(
    (index: number) => {
      isFocused && setParams({ index });
    },
    [isFocused, setParams]
  );

  const onTap = () => {
    StatusBar.setHidden(infoVisible, "slide");
    setInfoVisible(!infoVisible);
  };

  const deletePhoto = () => {
    setIsDeleting(false);
    const photo = params.images[params.index];
    fetchData("/photos/delete", { photoId: photo._id }, "POST")
      .then((data) => {
        if (photo._id === user?._id) {
          setUser({ ...user, profileImg: "" });
        }
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "შეტყობინება",
          textBody: data.message,
        });
        setParams({
          images: params.images.filter((image) => image._id !== photo._id),
          index: params.index,
        });
      })
      .catch(({ data }) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: data.message,
        });
      });
  };

  return (
    <View style={styles.container}>
      {isDeleting && (
        <Portal>
          <Dialog visible={true} onDismiss={() => setIsDeleting(false)}>
            <Dialog.Content>
              <Text variant="bodyMedium">ნამდვილად გსურთ წაშლა?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDeleting(false)}>არა</Button>
              <Button onPress={deletePhoto}>დიახ</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
      {infoVisible && (
        <Animated.View
          entering={mounted ? FadeInUp.duration(250) : undefined}
          exiting={FadeOutUp.duration(250)}
          style={[
            styles.toolbar,
            {
              height: top + 60,
              paddingTop: top,
            },
          ]}
        >
          <View style={styles.textContainer}>
            <IconButton icon={"chevron-left"} size={30} onPress={goBack} />
            <Text style={styles.headerText}>
              {params.index + 1} / {params.images.length}
            </Text>
          </View>
        </Animated.View>
      )}
      <AwesomeGallery
        ref={gallery}
        data={params.images.map((photo) => ({
          _id: photo._id,
          uri: photo.url,
        }))}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        initialIndex={params.index}
        numToRender={3}
        doubleTapInterval={150}
        onIndexChange={onIndexChange}
        onSwipeToClose={goBack}
        onTap={onTap}
        loop
        onScaleEnd={(scale) => {
          if (scale < 0.8) {
            goBack();
          }
        }}
      />
      {infoVisible && (
        <Animated.View
          entering={mounted ? FadeInDown.duration(250) : undefined}
          exiting={FadeOutDown.duration(250)}
          style={[
            styles.toolbar,
            styles.bottomToolBar,
            {
              height: bottom + 100,
              paddingBottom: bottom,
            },
          ]}
        >
          <View style={styles.buttonsContainer}>
            <IconButton
              icon={"delete"}
              size={30}
              iconColor="red"
              onPress={() => setIsDeleting(true)}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  toolbar: {
    position: "absolute",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  bottomToolBar: {
    bottom: 0,
  },
  headerText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    width: "80%",
    textAlign: "center",
  },
});
