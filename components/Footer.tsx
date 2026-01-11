import { View, Text, Pressable } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { theme } from 'utils/theme';

interface Props {
  total: number;
  onAdd: () => void;
}

export default function HomeFooter({ total, onAdd }: Props) {
  return (
    <View className="absolute bottom-[72px] left-0 right-0 px-400">
      <View className="flex-row items-center justify-between">
        {/* Total */}
        <View className="rounded-full bg-highlight px-500 py-300">
          <Text className="text-300 font-medium text-foreground">Total : ${total}</Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-400">
          <Pressable className="h-850 w-850 flex items-center justify-center rounded-600 bg-highlight p-400">
            <Search size={24} color={theme.colors.foreground} />
          </Pressable>

          <Pressable
            onPress={onAdd}
            className="h-850 w-850 flex items-center justify-center rounded-600 bg-accent p-400">
            <Plus size={32} color={theme.colors.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
