import { View } from "react-native";
import { Button, Dialog, Text } from "react-native-paper";
import { formatDate } from "../../lib/helpers";
import { useDialog } from "../../context/dialog";

export default function BlockedModal({
  reason,
  unblockAt,
  closeDialog,
}: {
  reason: string;
  unblockAt: Date | null;
  closeDialog: () => void;
}) {
  return (
    <>
      <Dialog.Title>თქვენი პროფილი დაბლოკილია!</Dialog.Title>
      <Dialog.Content>
        <Text variant="labelSmall">
          სამწუხაროდ თქვენ ვერ გააგრძელებთ აპლიკაციის გამოყენებას რადგან თქვენი
          პროფილი დაბლოკილია წესების დარღვევის გამო.
        </Text>
        {reason && <Text variant="labelSmall">მიზეზი: {reason}</Text>}
        {unblockAt && (
          <Text variant="labelSmall">
            განბლოკვის თარიღი: {formatDate(unblockAt)}
          </Text>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={closeDialog}>OK</Button>
      </Dialog.Actions>
    </>
  );
}
