import { View, Pressable } from 'react-native';
import { Home, Archive, User } from 'lucide-react-native';
import { theme } from 'utils/theme';

interface BottomNavigationProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {
  const getIconColor = (screen: string) => {
    return activeScreen === screen ? theme.colors.primary : theme.colors.foreground;
  };

  return (
    <View className="align-center shadow-3xl absolute bottom-0 left-0 right-0 h-[10%] justify-center rounded-t-[60px] bg-background-sec px-[30px]">
      <View className="flex-row justify-between">
        <Pressable onPress={() => onNavigate('home')}>
          <Home size={22} color={getIconColor('home')} />
        </Pressable>

        <Pressable onPress={() => onNavigate('archive')}>
          <Archive size={22} color={getIconColor('archive')} />
        </Pressable>

        <Pressable onPress={() => onNavigate('profile')}>
          <User size={22} color={getIconColor('profile')} />
        </Pressable>
      </View>
    </View>
  );
}
