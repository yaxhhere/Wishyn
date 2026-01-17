import { View } from 'react-native';
import HomeScreen from 'screens/HomeScreen';
import BottomNavigation from 'components/BottomNavigation';
import './global.css';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView className="bg-background flex-1 flex-col gap-0">
      <HomeScreen />
      {/* <BottomNavigation /> */}
    </SafeAreaView>
  );
}
