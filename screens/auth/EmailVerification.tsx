import * as SecureStore from "expo-secure-store";
import {
  Animated,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { Button, Text as PaperText } from "react-native-paper";
import { fetchData } from "../../lib/helpers";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useUser } from "../../context/user";

const { Value, Text: AnimatedText } = Animated;

const CELL_COUNT = 4;
const CELL_SIZE = 70;
const CELL_BORDER_RADIUS = 8;
const DEFAULT_CELL_BG_COLOR = "#fff";
const NOT_EMPTY_CELL_BG_COLOR = "#3557b7";
const ACTIVE_CELL_BG_COLOR = "#f7fafe";

const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
const animateCell = ({
  hasValue,
  index,
  isFocused,
}: {
  hasValue: boolean;
  index: number;
  isFocused: boolean;
}) => {
  Animated.parallel([
    Animated.timing(animationsColor[index], {
      useNativeDriver: false,
      toValue: isFocused ? 1 : 0,
      duration: 250,
    }),
    Animated.spring(animationsScale[index], {
      useNativeDriver: false,
      toValue: hasValue ? 0 : 1,
      duration: hasValue ? 300 : 250,
    } as any),
  ]).start();
};

type Props = NativeStackScreenProps<RootStackParamList, "EmailVerification">;

const EmailVerification = ({ route }: Props) => {
  const { email } = route.params;
  const { setUser } = useUser();
  const [value, setValue] = useState("");
  const [counter, setCounter] = useState(120);
  const [submitting, setSubmitting] = useState(false);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const renderCell = ({
    index,
    symbol,
    isFocused,
  }: {
    index: number;
    symbol: string;
    isFocused: boolean;
  }) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
      backgroundColor: hasValue
        ? animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          })
        : animationsColor[index].interpolate({
            inputRange: [0, 1],
            outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
          }),
      borderRadius: animationsScale[index].interpolate({
        inputRange: [0, 1],
        outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
      }),
      transform: [
        {
          scale: animationsScale[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        },
      ],
    };

    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    setTimeout(() => {
      animateCell({ hasValue, index, isFocused });
    }, 0);

    return (
      <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}
      >
        {symbol || (isFocused ? <Cursor /> : null)}
      </AnimatedText>
    );
  };

  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer as any);
  }, [counter]);

  const resend = () => {
    if (!email || counter > 0) return;
    fetchData("/auth/send-verification-code", { email }, "POST", false)
      .then((data) => {
        console.log(data);
        if (data.success) {
          setCounter(120);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "შეტყობინება",
            textBody: data.message,
          });
        }
      })
      .catch(({ data }) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: data.message,
        });
      });
  };

  const onSubmit = () => {
    if (!email) return;
    setSubmitting(true);
    fetchData("/auth/verify", { email, code: value }, "POST", false)
      .then(async (data) => {
        if (data.success) {
          await SecureStore.setItemAsync("token", data.token);
          setUser(data.user);
        }
      })
      .catch(({ data }) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "შეცდომა",
          textBody: data.message,
        });
        setValue("");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <SafeAreaView style={styles.root}>
      <PaperText
        variant="headlineSmall"
        style={{ marginVertical: 20, marginLeft: "auto", marginRight: "auto" }}
      >
        ვერიფიკაცია
      </PaperText>
      <Text style={styles.subTitle}>
        გთხოვთ შეიყვანოთ თქვენ მიერ მითითებული{"\n"}
        მეილზე გამოგზავნილი კოდი. კოდი აქტიური იქნება 5 წუთის განმავლობაში.
      </Text>

      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={renderCell}
      />
      <View style={{ flex: 1, gap: 10, paddingHorizontal: 20 }}>
        <Button
          mode="contained"
          disabled={value.length < CELL_COUNT || submitting}
          loading={submitting}
          onPress={onSubmit}
        >
          გაგრძელება
        </Button>
        <Button icon={"reload"} onPress={resend} disabled={counter > 0}>
          {counter > 0
            ? `თავიდან გამოგზავნა (${counter} წმ)`
            : "თავიდან გამოგზავნა"}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: {
    height: CELL_SIZE,
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cell: {
    marginHorizontal: 8,
    height: CELL_SIZE,
    width: CELL_SIZE,
    lineHeight: CELL_SIZE - 5,
    ...Platform.select({ web: { lineHeight: 65 } }),
    fontSize: 30,
    textAlign: "center",
    borderRadius: CELL_BORDER_RADIUS,
    color: "#3759b8",
    backgroundColor: "#fff",

    // IOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    // Android
    elevation: 3,
  },

  // =======================

  root: {
    minHeight: 800,
    padding: 20,
  },
  title: {
    paddingTop: 50,
    color: "#000",
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
  },
  subTitle: {
    paddingTop: 30,
    color: "rgb(100 116 139)",
    textAlign: "center",
  },
});

export default EmailVerification;
