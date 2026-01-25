import { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from 'screens/HomeScreen';
// import ArchiveScreen from 'screens/ArchiveScreen';
// import ProfileScreen from 'screens/ProfileScreen';
import BottomNavigation from 'components/BottomNavigation';
import './global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreen from 'screens/ProfileScreen';
import HomeHeader from 'components/Header';
import { CurrencyProvider } from 'utils/context/currency';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      // case 'archive':
      //   return <ArchiveScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
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
