import { Avatar } from "react-native-paper";
import { getInitials } from "../../lib/helpers";

type Props = {
  imgSource: string | null;
  fullName: string;
  size?: number;
};

export default function UserAvatar({ imgSource, fullName, size = 64 }: Props) {
  return imgSource ? (
    <Avatar.Image size={size} source={{ uri: imgSource }} />
  ) : (
    <Avatar.Text label={getInitials(fullName)} size={size} />
  );
}
