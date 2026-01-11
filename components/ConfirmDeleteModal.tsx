import { Modal, View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Button } from './common/Button';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({ visible, onConfirm, onCancel }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="none">
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutDown.duration(200)}
          className="rounded-t-3xl bg-background-sec px-5 pb-8 pt-6">
          <Text className="text-textPrimary mb-2 text-lg font-semibold">Delete wish?</Text>

          <Text className="text-textSecondary mb-6">This action cannot be undone.</Text>

          <View className="flex-row justify-end gap-200">
            <Button title="Cancel" variant="ghost" onPress={onCancel} />
            <Button title="Delete" variant="danger" onPress={onConfirm} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
