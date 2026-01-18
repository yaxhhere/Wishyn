import { View, Text, Image, Pressable } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Wish } from 'types';
import { Ionicons } from '@expo/vector-icons';
import { Pencil } from 'lucide-react-native';

interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePurchase: () => void;
  onOpenLink: () => void;
}

export default function WishCard({ wish, onEdit, onDelete, onTogglePurchase, onOpenLink }: Props) {
  const [expanded, setExpanded] = useState(false);

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
    <View
      className={`mx-4 overflow-hidden rounded-800 border border-gray-200 bg-white pt-2 shadow-lg`}>
      {/* Collapsed State */}

      <View className="flex flex-col gap-200 px-400 py-300">
        <Pressable onPress={toggleExpand} className="mb-2 flex-row items-center">
          {/* Checkbox */}
          <Pressable onPress={handleCheckbox} className="mr-3">
            <View
              className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                isPurchased ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
              }`}>
              {isPurchased && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </Pressable>

          {/* Title and Price */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-[18px] font-bold ${
                isPurchased ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}>
              {wish.title}
            </Text>
            {/* Price Badge */}
            {/* <View className="self-start rounded-full bg-teal-600 px-5 py-2">
              <Text className="text-sm font-semibold text-white">
                {wish.currency} {wish.price}
              </Text>
            </View> */}
          </View>

          {/* Expand Icon */}
          <Pressable onPress={toggleExpand} className="ml-3">
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#6B7280" />
          </Pressable>
        </Pressable>
        {expanded && (
          <View>
            {/* Image + Category Row */}
            <View className="mb-3 flex-row items-center justify-between">
              {/* Image */}
              {wish.image ? (
                <Image
                  source={{ uri: wish.image }}
                  className="h-24 w-24 rounded-600 bg-muted"
                  resizeMode="cover"
                />
              ) : (
                <View className="border-border h-24 w-24 items-center justify-center rounded-600 border-2 ">
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
              )}

              {/* Category Badge */}
              {wish.category && wish.category.toLowerCase() != 'other' && (
                <View className="rounded-full bg-highlight px-400 py-300">
                  <Text className="text-200 text-foreground">{wish.category}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        <View className="flex flex-row justify-between">
          {/* Price Badge */}
          <View className="mb-4 self-start rounded-full bg-teal-600 px-5 py-2">
            <Text className="text-lg font-semibold text-white">
              {wish.currency} {wish.price}
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center justify-end gap-4 py-2">
            {wish.link && (
              <Pressable
                onPress={async () => {
                  try {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {
                    // Haptics not available
                  }
                  onOpenLink();
                }}>
                <Ionicons name="link" size={22} color="#374151" />
              </Pressable>
            )}

            <Pressable
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
                onEdit();
              }}>
              <Ionicons name="pencil" size={20} color="#374151" />
            </Pressable>

            <Pressable
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
                onDelete();
              }}>
              <Ionicons name="trash" size={22} color="#EF4444" />
            </Pressable>

            <Pressable
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
              }}>
              <Ionicons name="ellipsis-vertical" size={22} color="#374151" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
