import { View, Image } from 'react-native';
import logo from '../assets/logo_lettermak.png';

export default function HomeHeader() {
  return (
    <View className="px-400 pb-300 pt-400">
      <View className="flex-row gap-200 self-start ">
        <Image source={logo} className="h-700 w-700" resizeMode="contain" />
      </View>
    </View>
  );
}
