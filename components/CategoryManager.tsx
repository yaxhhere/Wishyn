import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCategories, NON_DELETABLE_CATEGORY } from 'utils/context/category';
import { Button } from './common/Button';
import ConfirmDeleteModal from './ConfirmDeleteModal';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CategoryManager({ visible, onClose }: Props) {
  const { categories, addCategory, deleteCategory, renameCategory } = useCategories();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /* ─── Helpers ─────────────────────────────────────────── */

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === editingCategory.toLowerCase()) {
      setEditingCategory(null);
      return;
    }

    const duplicate = categories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== editingCategory
    );

    if (duplicate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Duplicate', `"${trimmed}" already exists.`);
      return;
    }

    await renameCategory(editingCategory, trimmed);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingCategory(null);
  };

  const handleDelete = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingDelete(category);
  };

  const handleAdd = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const duplicate = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Duplicate', `"${trimmed}" already exists.`);
      return;
    }

    await addCategory(trimmed);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewCategoryName('');
    setShowAddInput(false);
  };

  const handleClose = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setShowAddInput(false);
    setPendingDelete(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={FadeInDown.duration(250).springify()}
            exiting={FadeOutDown.duration(200)}
            className="rounded-800 rounded-b-none bg-background p-400 shadow-2xl">
            {/* Handle bar */}
            <View className="mb-400 flex-row items-center justify-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>

            <Text className="mb-400 text-center text-lg font-semibold text-foreground">
              Manage Categories
            </Text>

            {/* Category List */}
            <ScrollView
              style={{ maxHeight: 360 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {categories.map((category, idx) => {
                const isProtected = category === NON_DELETABLE_CATEGORY;
                const isEditing = editingCategory === category;

                return (
                  <View
                    key={category}
                    className={`flex-row items-center px-200 py-300 ${
                      idx < categories.length - 1 ? 'border-b border-border' : ''
                    }`}>
                    {/* Name / Edit Input */}
                    <View className="flex-1">
                      {isEditing ? (

                        <TextInput
                          value={editValue}
                          onChangeText={setEditValue}
                          autoFocus
                           className="flex-1 rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                          onSubmitEditing={handleSaveEdit}
                          returnKeyType="done"
                        />
                      ) : (
                        <Text className={`text-300 ${isProtected ? 'text-muted' : 'text-foreground'}`}>
                          {category}
                          {isProtected && (
                            <Text className="text-100 text-muted"> (default)</Text>
                          )}
                        </Text>
                      )}
                    </View>

                    {/* Actions */}
                    {!isProtected && (
                      <View className="ml-300 flex-row gap-200">
                        {isEditing ? (
                          <>
                            {/* Confirm rename */}
                            <Pressable
                              onPress={handleSaveEdit}
                              className="h-12 w-12 items-center rounded-400 justify-center bg-primary">
                              <FontAwesome6 name="check" size={18} color="white" />
                            </Pressable>
                            {/* Cancel rename */}
                            <Pressable
                              onPress={() => setEditingCategory(null)}
                              className="h-12 w-12 items-center rounded-400 justify-center bg-grey1">
                              <Ionicons name="close" size={24} color="black" />
                            </Pressable>
                          </>
                        ) : (
                          <>
                            {/* Edit */}
                            <Pressable
                              onPress={() => {
                                Haptics.selectionAsync();
                                handleStartEdit(category);
                              }}
                              className="h-8 w-8 items-center justify-center">
                              <MaterialIcons name="edit" size={22} color="hsl(var(--background))" />
                            </Pressable>
                            {/* Delete */}
                            <Pressable
                              onPress={() => handleDelete(category)}
                              className="h-8 w-8 items-center justify-center">
                              <MaterialIcons name="delete" size={24} color="hsl(13, 82%, 58%)" />
                            </Pressable>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            {/* Add New Category */}
            <View className="mt-400" >
              {showAddInput ? (
                <View className="flex-row items-center gap-200">
                  <TextInput
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="New category name..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    className="flex-1 rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                    onSubmitEditing={handleAdd}
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={handleAdd}
                    className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Ionicons name="checkmark" size={18} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowAddInput(false);
                      setNewCategoryName('');
                    }}
                    className="h-10 w-10 items-center justify-center rounded-full bg-highlight">
                    <Ionicons name="close" size={18} color="#374151" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowAddInput(true);
                  }}
                  className="flex-row items-center justify-center gap-200 rounded-full bg-primary px-400 py-350">
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-200 font-medium text-primary-fg">Add New Category</Text>
                </Pressable>
              )}
            </View>

            {/* Footer close */}
            <View className="mt-400 flex-row justify-center">
              <Button title="Close" variant="ghost" onPress={handleClose} />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        title='Delete this category?'
        visible={!!pendingDelete}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteCategory(pendingDelete);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </Modal>
  );
}
