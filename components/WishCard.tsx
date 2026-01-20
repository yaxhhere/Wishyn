import { View, Text, Modal, Image, Pressable, Clipboard } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Wish } from 'types';
import { Ionicons } from '@expo/vector-icons';
import * as ClipboardExpo from 'expo-clipboard';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePurchase: () => void;
  onOpenLink: () => void;
}

export default function WishCard({ wish, onEdit, onDelete, onTogglePurchase, onOpenLink }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

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
      className={`mx-4 overflow-hidden rounded-800 border border-border bg-background pt-2 shadow-lg`}>
      {/* Collapsed State */}

      <View className="flex flex-col gap-200 px-400 py-300">
        <Pressable onPress={toggleExpand} className="mb-2 flex-row items-center">
          {/* Checkbox */}
          <Pressable onPress={handleCheckbox} className="mr-3">
            <View
              className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                isPurchased ? 'border-primary bg-primary' : 'border-border bg-background'
              }`}>
              {isPurchased && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </Pressable>

          {/* Title and Price */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-[18px] font-bold ${
                isPurchased ? 'text-muted line-through' : 'text-foreground'
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
          <Pressable onPress={toggleExpand} className="ml-300">
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
                <View className="h-24 w-24 items-center justify-center rounded-600 border-2 border-border ">
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
              )}

              {/* Category Badge */}
              {wish.category && wish.category.toLowerCase() !== 'unspecified' && (
                <View className="rounded-full bg-highlight px-400 py-300">
                  <Text className="text-200 text-foreground">{wish.category}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        <View className="flex flex-row items-center justify-between pb-200">
          {/* Price Badge */}
          <View className="rounded-full bg-primary px-400 py-300">
            <Text className="text-lg font-semibold text-primary-fg">
              {wish.currency} {wish.price}
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center justify-end gap-4 py-2">
            {wish.link && (
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowLinkModal(true);
                }}>
                <AntDesign name="link" size={20} color="hsl(var(--background))" />
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
              <MaterialIcons name="edit" size={22} color="hsl(var(--background))" />
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
              <MaterialIcons name="delete" size={24} color="hsl(13, 82%, 58%)" />
            </Pressable>

            {/* <Pressable
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {
                  // Haptics not available
                }
              }}>
              <Ionicons name="ellipsis-vertical" size={22} color="#374151" />
            </Pressable> */}
          </View>
        </View>
      </View>
      {/* Link Modal */}
      <Modal visible={showLinkModal} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowLinkModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-800 bg-background px-400 py-400 shadow-2xl">
              {/* Drag Handle */}
              <View className="mb-300 items-center">
                <View className="h-1 w-12 rounded-full bg-border" />
              </View>

              {/* Link text */}
              <Text numberOfLines={1} ellipsizeMode="tail" className="mb-400 text-400 text-muted">
                {wish.link}
              </Text>

              {/* Actions */}
              <View className="gap-100">
                <Pressable
                  onPress={() => {
                    setShowLinkModal(false);
                    onOpenLink();
                  }}
                  className="flex-row items-center gap-100 rounded-600 px-400 py-350">
                  <Ionicons name="open-outline" size={20} color="hsl(var(--foreground))" />
                  <Text className="font-medium text-foreground">Open link</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    await ClipboardExpo.setStringAsync(wish.link || '');
                    setShowLinkModal(false);
                  }}
                  className="flex-row items-center gap-300 rounded-600 px-400 py-350">
                  <Ionicons name="copy-outline" size={18} color="hsl(var(--foreground))" />
                  <Text className="font-medium text-foreground">Copy link</Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowLinkModal(false)}
                  className="flex-row items-center gap-300 rounded-600 px-400 py-350">
                  <Ionicons name="close" size={18} color="#EF4444" />
                  <Text className="font-medium text-danger">Close</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
