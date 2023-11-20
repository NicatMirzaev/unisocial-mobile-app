import { Button, Dialog, List, Text } from "react-native-paper";

export default function PremuimModal({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  return (
    <>
      <Dialog.Title>პრემიუმი თვეში მხოლოდ 15 ლარად!</Dialog.Title>
      <Dialog.Content>
        <Text variant="labelSmall">
          გადადი{" "}
          <Text variant="labelSmall" style={{ color: "#FFD700" }}>
            Premium
          </Text>
          -ზე და ისარგებლე უპირატესობებით თვეში მხოლოდ 15 ლარად:
        </Text>
        <List.Section>
          <List.Item
            title="რეაქციის დატოვება მესიჯებს"
            titleNumberOfLines={2}
            left={() => <List.Icon icon="emoticon" />}
          />
          <List.Item
            title="თქვენი პროფილი გამოჩნდება პრემიუმ სტუდენთა სიაში"
            titleNumberOfLines={3}
            left={() => <List.Icon icon="account-star" />}
          />
          <List.Item
            title="ულიმიტო ფოტოს ატვირთვა"
            titleNumberOfLines={2}
            left={() => <List.Icon icon="image-multiple" />}
          />
          <List.Item
            title="გამოჩნდება PRO ნიშანი თქვენ პროფილზე"
            titleNumberOfLines={3}
            left={() => (
              <List.Icon icon="professional-hexagon" color={"#FFD700"} />
            )}
          />
        </List.Section>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => {}}>გამოწერა</Button>
      </Dialog.Actions>
    </>
  );
}
