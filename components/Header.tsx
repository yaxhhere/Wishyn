import { View, Image, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import logo from '../assets/logo_lettermak.png';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import InfoDialog from './header/InfoDialog';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function HomeHeader() {
  const [showBombDialog, setShowBombDialog] = useState(false);

  return (
    <>
      <View className="flex flex-row justify-between px-400 pb-300 pt-400">
        <View className="flex-row gap-200 self-start">
          <Image source={logo} className="h-700 w-700" resizeMode="contain" />
        </View>

        <BombButton onPress={() => setShowBombDialog(true)} />
      </View>

      <InfoDialog visible={showBombDialog} onClose={() => setShowBombDialog(false)} />
    </>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BombButton({ onPress }: { onPress: () => void }) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withDelay(
        3000, // wait few seconds before wobble
        withSequence(
          withTiming(-12, { duration: 80 }),
          withTiming(12, { duration: 80 }),
          withTiming(-8, { duration: 80 }),
          withTiming(8, { duration: 80 }),
          withTiming(0, { duration: 80 })
        )
      ),
      3, // infinite repeat
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <AnimatedPressable onPress={onPress} style={animatedStyle}>
      <FontAwesome5 name="bomb" size={24} />
    </AnimatedPressable>
  );
}
