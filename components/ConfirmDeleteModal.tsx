import { Modal, View, Text, Pressable } from 'react-native';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <View className="w-full rounded-2xl bg-white p-6">
          <Text className="text-textPrimary mb-2 text-lg font-semibold">Delete wish?</Text>

          <Text className="text-textSecondary mb-6">This action cannot be undone.</Text>

          <View className="flex-row justify-end gap-4">
            <Pressable onPress={onCancel}>
              <Text className="text-textSecondary">Cancel</Text>
            </Pressable>

            <Pressable onPress={onConfirm}>
              <Text className="text-danger font-semibold">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
