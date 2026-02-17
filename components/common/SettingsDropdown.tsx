import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props<T> = {
  label: string;
  value: T;
  options: T[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
  renderLeft?: (value: T) => React.ReactNode;
};

function SettingsDropdown<T extends string>({
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  renderLeft,
}: Props<T>) {
  return (
    <View className="flex-row items-center justify-between p-350">
      <View className="relative">
        <TouchableOpacity
          onPress={onToggle}
          className="flex-row items-center gap-200 rounded-full bg-highlight px-400 py-300">
          {renderLeft?.(value)}
          <Text className="text-200 font-medium text-foreground">{value}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="hsl(60, 3%, 47%)"
          />
        </TouchableOpacity>

        {isOpen && (
          <View
            className="absolute right-0 top-full mt-200 min-w-[120px] rounded-600 border-2 border-border bg-background p-400 shadow-2xl"
            style={{ zIndex: 9999 }}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => onSelect(option)}
                className={`flex-row items-center justify-center gap-300 px-400 py-300 ${
                  index < options.length - 1 ? 'border-b border-grey1' : ''
                } ${index === 0 ? 'rounded-t-400' : ''} ${
                  index === options.length - 1 ? 'rounded-b-400' : ''
                }`}>
                {renderLeft?.(option)}
                <Text className="text-200 text-foreground">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default memo(SettingsDropdown);
