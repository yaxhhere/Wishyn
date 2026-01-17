import { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from 'screens/HomeScreen';
// import ArchiveScreen from 'screens/ArchiveScreen';
// import ProfileScreen from 'screens/ProfileScreen';
import BottomNavigation from 'components/BottomNavigation';
import './global.css';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      // case 'archive':
      //   return <ArchiveScreen />;
      // case 'profile':
      //   return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 flex-col bg-background">
      <View className="h-[92%] w-full">
        {renderScreen()}
      </View>
      <BottomNavigation 
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />
    </SafeAreaView>
  );
}