import { View } from 'react-native';
import { IconName, icons } from 'components/icons';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export default function Icon({ name, size = 24, color = '#000' }: Props) {
  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return (
    <View>
      <IconComponent size={size} color={color} />
    </View>
  );
}
