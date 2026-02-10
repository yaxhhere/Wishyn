import { Modal, Pressable, Text, View, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InfoDialog({ visible, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!visible) return null;

  const handleSubmit = () => {
    if (!email.trim() || !message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 👉 Replace this later with API / Email / Firebase / Supabase etc
    console.log('Feedback:', { email, message });

    Alert.alert('Thanks!', 'Feedback submitted ❤️');

    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <Modal transparent animationType="none">
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={FadeInDown.duration(250).springify()}
            exiting={FadeOutDown.duration(200)}
            className="rounded-800 rounded-b-none bg-background p-500 shadow-2xl">
            {/* Handle */}
            <View className="mb-400 flex-row items-center justify-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>

            {/* Title */}
            <Text className="mb-400 text-center text-lg font-semibold">ABITSTUPID LLP</Text>

            {/* Credit Text */}
            <Text className="mb-400 text-center text-200 text-muted">
              Built with chaos, caffeine & questionable brilliance ☕
            </Text>

            {/* -------- EMAIL INPUT -------- */}
            <View className="mb-300">
              <Text className="mb-200 text-xs font-medium text-gray-500">EMAIL</Text>

              <TextInput
                placeholder="you@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
                className="rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
              />
            </View>

            {/* -------- MESSAGE INPUT -------- */}
            <View className="mb-400">
              <Text className="mb-200 text-xs font-medium text-gray-500">MESSAGE</Text>

              <TextInput
                placeholder="Tell us what's cooking..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
                className="rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              className="flex-row items-center justify-center gap-200 rounded-full bg-primary px-400 py-350">
              <Ionicons name="send-outline" size={18} color="white" />
              <Text className="font-medium text-primary-fg">Send Feedback</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
