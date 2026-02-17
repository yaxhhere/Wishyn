import { Modal, Pressable, Text, View, TextInput, Alert, Linking } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from 'components/common/Button';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InfoDialog({ visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'review' | 'feedback'>('review');
  const [rating, setRating] = useState(0);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!visible) return null;

  // 👉 Replace with your actual Play Store link
  const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=YOUR_APP_PACKAGE';

  const openPlayStore = async () => {
    await Linking.openURL(PLAY_STORE_LINK);
  };

  const handleReviewSubmit = () => {
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    openPlayStore();
    onClose();
  };

  const handleFeedbackSubmit = () => {
    if (!email.trim() || !message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
            <Text className="mb-100 text-center text-400 font-semibold">ABITSTUPID LLP</Text>
            <Text className=" text-center text-200 text-muted">{`Hiya! Fellow stupid...hope you're enjoying life.`}</Text>
            <View className="my-400 flex flex-row items-center justify-center ">
              <Button
                title="Visit Us"
                size="md"
                variant="danger"
                onPress={() => Linking.openURL('https://www.abitstupidcompany.com')}
              />
            </View>

            {/* Tabs */}
            <View className="mb-400 flex-row rounded-full bg-background-sec p-100">
              {['review', 'feedback'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab as any)}
                    className={`flex-1 rounded-full px-400 py-350 ${isActive ? 'bg-primary' : ''}`}>
                    <Text
                      className={`text-center font-medium ${
                        isActive ? 'text-primary-fg' : 'text-muted'
                      }`}>
                      {tab === 'review' ? 'Review' : 'Feedback'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ---------------- REVIEW TAB ---------------- */}
            {activeTab === 'review' && (
              <View>
                <Text className="text-center text-muted">We know you love us!</Text>
                <Text className="mb-300 text-center text-muted">
                  To show some PDA please rate us here.
                </Text>

                {/* Star Rating */}
                <View className="mb-400 flex-row justify-center gap-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={34}
                        color="#FACC15"
                      />
                    </Pressable>
                  ))}
                </View>

                <Button onPress={openPlayStore}>
                  <Ionicons name="open-outline" size={18} color="white" />
                  <Text className=" text-primary-fg">Rate on Play Store</Text>
                </Button>
              </View>
            )}

            {/* ---------------- FEEDBACK TAB ---------------- */}
            {activeTab === 'feedback' && (
              <View>
                {/* Email */}
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

                {/* Message */}
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

                <Button onPress={handleFeedbackSubmit}>
                  <>
                    <Ionicons name="send-outline" size={20} color="white" />
                    <Text className="font-medium text-primary-fg">Send Feedback</Text>
                  </>
                </Button>
              </View>
            )}
            <Button title="Close" size="md" variant="ghost" onPress={onClose} />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
