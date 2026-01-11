import { View, Text, Pressable } from 'react-native';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-primarySoft rounded-card mb-6 px-6 py-4">
        <Text className="text-primary text-lg font-semibold">No wishes yet</Text>
      </View>

      <Text className="text-textSecondary mb-8 text-center">
        Add something meaningful you want to achieve or buy.
      </Text>

      <Pressable onPress={onAdd} className="bg-primary rounded-button px-8 py-4">
        <Text className="font-semibold text-white">Add your first wish</Text>
      </Pressable>
    </View>
  );
}
