import { View, Text, Pressable } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { theme } from 'utils/theme';

interface Props {
  total: number;
  onAdd: () => void;
}

export default function HomeFooter({ total, onAdd }: Props) {
  return (
    <View className="px-400 absolute bottom-[72px] left-0 right-0">
      <View className="flex-row items-center justify-between">
        {/* Total */}
        <View className="bg-highlight px-500 py-300 rounded-full">
          <Text className="text-foreground text-300 font-medium">Total : ${total}</Text>
        </View>

        {/* Actions */}
        <View className="gap-400 flex-row">
          <Pressable className="bg-highlight p-400 rounded-full">
            <Search size={20} color={theme.colors.foreground} />
          </Pressable>

          <Pressable onPress={onAdd} className="bg-accent p-400 rounded-full">
            <Plus size={20} color={theme.colors.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
