import { View } from "react-native";
import { Text } from "react-native-paper";
import { formatDate } from "../../lib/helpers";

export default function BlockedModal({
  reason,
  unblockAt,
}: {
  reason: string;
  unblockAt: Date;
}) {
  return (
    <>
      <Text variant="titleMedium" style={{ textAlign: "center" }}>
        თქვენი პროფილი დაბლოკილია!
      </Text>
      <Text
        variant="labelSmall"
        style={{
          textAlign: "center",
          paddingVertical: 10,
        }}
      >
        სამწუხაროდ თქვენ ვერ გააგრძელებთ აპლიკაციის გამოყენებას რადგან თქვენი
        პროფილი დაბლოკილია საზოგადოების წესების დარღვევის გამო.
      </Text>
      {reason && (
        <Text variant="labelSmall" style={{ textAlign: "center" }}>
          მიზეზი: {reason}
        </Text>
      )}
      {unblockAt && (
        <Text variant="labelSmall" style={{ textAlign: "center" }}>
          განბლოკვის თარიღი: {formatDate(unblockAt)}
        </Text>
      )}
    </>
  );
}
