import { View, Text, Image, Pressable } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Wish } from 'types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePurchase: () => void;
  onOpenLink: () => void;
}

export default function WishCard({ 
  wish, 
  onEdit, 
  onDelete, 
  onTogglePurchase,
  onOpenLink 
}: Props) {
  const [expanded, setExpanded] = useState(true);

  // Safety check
  if (!wish) return null;

  const isPurchased = wish.isPurchased ?? false;

  const toggleExpand = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available
    }
    setExpanded((p) => !p);
  };

  const handleCheckbox = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics not available
    }
    onTogglePurchase();
  };

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header - Always Visible */}
      <Pressable
        onPress={toggleExpand}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-1 flex-row items-center gap-3">
          {/* Checkbox */}
          <Pressable onPress={handleCheckbox} className="p-0.5">
            <View 
              className={`h-5 w-5 items-center justify-center rounded border-2 ${
                isPurchased 
                  ? 'border-teal-600 bg-teal-600' 
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isPurchased && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
          </Pressable>

          {/* Title */}
          <Text 
            numberOfLines={1} 
            className={`flex-1 text-base font-medium ${
              isPurchased ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {wish.title}
          </Text>
        </View>

        {/* Expand/Collapse Icon */}
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </Pressable>

      {/* Collapsed State - Price Badge Only */}
      {!expanded && (
        <View className="px-4 pb-3">
          <View className="self-start rounded-full bg-teal-600 px-4 py-1.5">
            <Text className="text-sm font-semibold text-white">
              {wish.currency}{wish.price}
            </Text>
          </View>
        </View>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View className="px-4 pb-4">
          {/* Image + Category Row */}
          <View className="mb-3 flex-row items-center justify-between">
            {/* Image */}
            {wish.image ? (
              <Image 
                source={{ uri: wish.image }} 
                className="h-20 w-20 rounded-xl bg-gray-100"
                resizeMode="cover"
              />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="image-outline" size={24} color="#9CA3AF" />
              </View>
            )}

            {/* Category Badge */}
            {wish.category && (
              <View className="rounded-full bg-gray-100 px-4 py-1.5">
                <Text className="text-xs font-medium text-gray-700">
                  {wish.category}
                </Text>
              </View>
            )}
          </View>

          {/* Price Badge */}
          <View className="mb-3 self-start rounded-full bg-teal-600 px-4 py-1.5">
            <Text className="text-sm font-semibold text-white">
              {wish.currency}{wish.price}
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row justify-end gap-4">
            {/* Link */}
            {wish.link && (
              <Pressable 
                onPress={async () => {
                  try {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {
                    // Haptics not available
                  }
                  onOpenLink();
                }}
                className="p-1"
              >
                <Ionicons name="link-outline" size={20} color="#374151" />
              </Pressable>
            )}

            {/* Edit */}
            <Pressable 
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
                onEdit();
              }}
              className="p-1"
            >
              <Ionicons name="pencil-outline" size={20} color="#374151" />
            </Pressable>

            {/* Delete */}
            <Pressable 
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
                onDelete();
              }}
              className="p-1"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>

            {/* More Options */}
            <Pressable 
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
              }}
              className="p-1"
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}