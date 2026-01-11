import { Pressable, Text } from 'react-native';

export default function FloatingAddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-8 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
      <Text className="text-3xl font-light text-white">+</Text>
    </Pressable>
  );
}
