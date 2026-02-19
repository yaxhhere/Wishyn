import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface AccordionProps {
  title: string;
  titleVariant?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function StyledAccordion({
  title,
  titleVariant = 'default',
  children,
  defaultOpen = true,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((p) => !p);
  };

  const titleClass =
    titleVariant === 'accent'
      ? 'text-300 font-medium text-accent'
      : 'text-300 font-medium text-muted';

  return (
    <View className="mb-400">
      {/* HEADER */}
      <TouchableOpacity
        onPress={toggle}
        className="flex-row items-center justify-between rounded-600 border border-border bg-background-sec px-500 py-400">
        <Text className={titleClass}>{title}</Text>

        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="hsl(60, 3%, 47%)" />
      </TouchableOpacity>

      {/* CONTENT (Feels separate from header) */}
      {open && (
        <View className="mt-300 rounded-600 border border-border bg-background-sec p-200">
          {children}
        </View>
      )}
    </View>
  );
}
