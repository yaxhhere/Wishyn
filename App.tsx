import { useState } from 'react';
import { View } from 'react-native';
import BottomNavigation from 'components/BottomNavigation';
import './global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreen from 'screens/ProfileScreen';
import HomeHeader from 'components/Header';
import { CurrencyProvider } from 'utils/context/currency';
import WishesScreen from 'screens/WishesScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('wishes');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'wishes':
        return <WishesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <WishesScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 flex-col bg-background">
      {/* HEADER */}
      <CurrencyProvider>
        <HomeHeader />
        <View className="h-[80%] w-full">{renderScreen()}</View>
        <BottomNavigation activeScreen={activeScreen} onNavigate={setActiveScreen} />
      </CurrencyProvider>
    </SafeAreaView>
  );
}
