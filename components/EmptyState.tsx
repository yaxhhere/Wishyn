import { View, Text } from 'react-native';
import { Button } from './common/Button';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-400">
      <View className="bg-primarySoft rounded-card px-400">
        <Text className="text-400 font-semibold text-muted">No wishes yet</Text>
      </View>

      <Text className="text-textSecondary mb-4 text-center">
        Add something meaningful you want to buy.
      </Text>

      <Button title="Add a wish" variant="primary" onPress={onAdd} />
    </View>
  );
}
