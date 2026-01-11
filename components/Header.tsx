import { View, Text } from 'react-native';

export default function HomeHeader() {
  return (
    <View className="px-400 pt-400 pb-300">
      <View className="border-grey1 px-500 py-200 self-start rounded-full border">
        <Text className="text-foreground text-600 font-semibold">Wishyn</Text>
      </View>
    </View>
  );
}
