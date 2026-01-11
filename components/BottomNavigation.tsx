import { View, Pressable } from 'react-native';
import { Home, Archive, User } from 'lucide-react-native';
import { theme } from 'utils/theme';

export default function BottomNavigation() {
  return (
    <View className="bg-background-sec align-center px-600 absolute bottom-0 left-0 right-0 h-20 justify-center rounded-t-2xl shadow-xl">
      <View className="flex-row justify-between">
        <Pressable>
          <Home size={22} color={theme.colors.foreground} />
        </Pressable>

        <Pressable>
          <Archive size={22} color={theme.colors.foreground} />
        </Pressable>

        <Pressable>
          <User size={22} color={theme.colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}
