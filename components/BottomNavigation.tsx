import { View, Pressable } from 'react-native';
import { theme } from 'utils/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface BottomNavigationProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {
  const getIconColor = (screen: string) => {
    return activeScreen === screen ? 'hsl(210, 40%, 98%)' : 'hsl(217, 19%, 69%)';
  };
  const getIconClass = (screen: string) => {
    return activeScreen === screen
      ? 'rounded-full bg-primary  h-700 w-800 flex items-center justify-center'
      : 'h-700 flex items-center justify-center w-800';
  };

  return (
    <View className="align-center shadow-3xl absolute bottom-0 left-0 right-0 justify-center rounded-t-[64px] border-2 border-border bg-background px-850 py-600">
      <View className="flex-row items-center justify-evenly">
        {/* <Pressable onPress={() => onNavigate('home')}>
          <Home size={22} color={getIconColor('home')} />
        </Pressable> */}

        <Pressable onPress={() => onNavigate('wishes')} className={getIconClass('wishes')}>
          <MaterialIcons name="wallet" size={28} color={getIconColor('wishes')} />
        </Pressable>

        <Pressable onPress={() => onNavigate('profile')} className={getIconClass('profile')}>
          <FontAwesome6 name="user-large" size={18} color={getIconColor('profile')} />
        </Pressable>
      </View>
    </View>
  );
}
