import { View, Text, Pressable } from 'react-native';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-primarySoft rounded-card mb-2 px-6">
        <Text className="text-lg font-semibold text-primary">No wishes yet</Text>
      </View>

      <Text className="text-textSecondary mb-4 text-center">
        Add something meaningful you want to achieve or buy.
      </Text>

      <Pressable onPress={onAdd} className="rounded-button rounded-2xl bg-primary px-8 py-4">
        <Text className="font-semibold text-white">Add your first wish</Text>
      </Pressable>
    </View>
  );
}
