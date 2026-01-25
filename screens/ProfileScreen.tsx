import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

import { storageService } from 'utils/storage';
import { Wish } from 'types';
import { Currency } from 'utils/helper';
import { useCurrency } from 'utils/context/currency';
import { Paths, File, Directory } from 'expo-file-system';

type ExportFormat = 'CSV' | 'JSON' | 'XML';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export default function SettingsScreen() {
  /* -------------------- GLOBAL (PERSISTED) -------------------- */
  const { currency, setCurrency } = useCurrency();

  /* -------------------- LOCAL STATE -------------------- */
  const [theme, setTheme] = useState('Light');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('CSV');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);

  const themes = ['Light', 'Dark'];
  const currencies: Currency[] = ['INR', 'USD', 'EUR'];
  const formats: ExportFormat[] = ['CSV', 'JSON', 'XML'];

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    loadSettings();
    loadWishes();
  }, []);

  const loadSettings = async () => {
    const savedExportFormat = await storageService.getExportFormat();
    if (savedExportFormat) setExportFormat(savedExportFormat as ExportFormat);
  };

  const loadWishes = async () => {
    const loadedWishes = await storageService.loadWishes();
    setWishes(loadedWishes);
  };

  /* -------------------- HELPERS -------------------- */
  const toggleDropdown = async (dropdown: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  /* -------------------- HANDLERS -------------------- */
  const handleCurrencyChange = async (newCurrency: Currency) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    await setCurrency(newCurrency);
    setOpenDropdown(null);
  };

  const handleExportFormatChange = async (format: ExportFormat) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setExportFormat(format);
    await storageService.saveExportFormat(format);
    setOpenDropdown(null);
  };

  /* -------------------- EXPORT HELPERS -------------------- */
  const escapeCSVField = (field: string | number | boolean): string => {
    const str = String(field);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportToCSV = (data: Wish[]): string => {
    const headers = [
      'Title',
      'Price',
      'Currency',
      'Category',
      'Link',
      'Is Purchased',
      'Created At',
    ];

    const rows = data.map((wish) => [
      escapeCSVField(wish.title),
      escapeCSVField(wish.price),
      escapeCSVField(wish.currency),
      escapeCSVField(wish.category || ''),
      escapeCSVField(wish.link || ''),
      escapeCSVField(wish.isPurchased ? 'Yes' : 'No'),
      escapeCSVField(new Date(wish.targetDate).toLocaleDateString()),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const exportToJSON = (data: Wish[]): string => JSON.stringify(data, null, 2);

  const escapeXML = (str: string | number | boolean): string => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const exportToXML = (data: Wish[]): string => {
    const xmlItems = data
      .map(
        (wish) => `
  <wish>
    <title>${escapeXML(wish.title)}</title>
    <price>${escapeXML(wish.price)}</price>
    <currency>${escapeXML(wish.currency)}</currency>
    <category>${escapeXML(wish.category || '')}</category>
    <link>${escapeXML(wish.link || '')}</link>
    <isPurchased>${escapeXML(wish.isPurchased as boolean)}</isPurchased>
    <createdAt>${escapeXML(wish.targetDate)}</createdAt>
  </wish>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<wishes>${xmlItems}\n</wishes>`;
  };

  const handleExport = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (wishes.length === 0) {
      Alert.alert('No Data', 'There are no wishes to export.');
      return;
    }

    try {
      let content = '';
      let extension = '';
      let mimeType = '';

      switch (exportFormat) {
        case 'CSV':
          content = exportToCSV(wishes);
          extension = 'csv';
          mimeType = 'text/csv';
          break;

        case 'JSON':
          content = exportToJSON(wishes);
          extension = 'json';
          mimeType = 'application/json';
          break;

        case 'XML':
          content = exportToXML(wishes);
          extension = 'xml';
          mimeType = 'application/xml';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      const fileName = `wishes_${Date.now()}.${extension}`;

      /* ---------------- WEB ---------------- */
      if (Platform.OS === 'web') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Alert.alert('Success', 'File downloaded successfully!');
        return;
      }

      /* -------- ASK USER WHERE TO SAVE -------- */
      const targetDirectory = await Directory.pickDirectoryAsync();

      if (!targetDirectory) {
        // User cancelled picker
        return;
      }

      const file = targetDirectory.createFile(fileName, mimeType);

      await file.write(content);

      Alert.alert('Export Successful', `File saved to:\n${targetDirectory.uri}`);

      /* -------- OPTIONAL SHARE -------- */
      // if (await Sharing.isAvailableAsync()) {
      //   await Sharing.shareAsync(file.uri, {
      //     mimeType,
      //     dialogTitle: 'Export Wishes Data',
      //     UTI: mimeType,
      //   });
      // }
    } catch (error) {
      console.log('Export error: (Rejection)', error);

      // Alert.alert('Export Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /* -------------------- DELETE -------------------- */
  const handleDelete = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    try {
      await storageService.clearAllData();
      setWishes([]);
      setShowDeleteModal(false);
      Alert.alert('Success', 'All data has been deleted.');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-400">
        {/* Alert Banner */}
        <View className="mb-400 flex-row items-start gap-300 rounded-600 bg-background-sec p-350">
          <View className="mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-danger">
            <Text className="text-100 font-bold text-danger-fg">!</Text>
          </View>
          <Text className="flex-1 text-200 text-foreground">
            We're bringing the login/sign up soon.
          </Text>
        </View>

        {/* Basic Section Card */}
        <View className="mb-400 rounded-600 border border-grey1 bg-background-sec">
          {/* Basic Dropdown Header */}
          <TouchableOpacity
            onPress={() => toggleDropdown('basic')}
            className="flex-row items-center justify-between border-b border-grey1 p-350">
            <Text className="text-300 text-foreground">Basic</Text>
            <Ionicons
              name={openDropdown === 'basic' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="hsl(60, 3%, 47%)"
            />
          </TouchableOpacity>

          {/* Theme Row */}
          <View className="flex-row items-center justify-between border-b border-grey1 p-350">
            <Text className="text-300 text-foreground">Theme</Text>
            <View className="relative">
              <TouchableOpacity
                onPress={() => toggleDropdown('theme')}
                className="flex-row items-center gap-200 rounded-full bg-grey1 px-500 py-300">
                <Text className="text-400">☀️</Text>
                <Text className="text-200 text-foreground">{theme}</Text>
                <Ionicons
                  name={openDropdown === 'theme' ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="hsl(60, 3%, 47%)"
                />
              </TouchableOpacity>
              {openDropdown === 'theme' && (
                <View
                  className="absolute right-0 top-full mt-200 min-w-[120px] rounded-400 border border-grey1 bg-background shadow-lg"
                  style={{ zIndex: 9999 }}>
                  {themes.map((t, index) => (
                    <TouchableOpacity
                      key={t}
                      onPress={async () => {
                        try {
                          await Haptics.selectionAsync();
                        } catch {}
                        setTheme(t);
                        setOpenDropdown(null);
                      }}
                      className={`px-500 py-300 ${index < themes.length - 1 ? 'border-b border-grey1' : ''} ${index === 0 ? 'rounded-t-400' : ''} ${index === themes.length - 1 ? 'rounded-b-400' : ''}`}>
                      <Text className="text-200 text-foreground">{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Currency Row */}
          <View className="flex-row items-center justify-between p-350">
            <Text className="text-300 text-foreground">Currency</Text>
            <View className="relative">
              <TouchableOpacity
                onPress={() => toggleDropdown('currency')}
                className="flex-row items-center gap-200 rounded-full bg-grey1 px-500 py-300">
                <Text className="text-400">{CURRENCY_SYMBOLS[currency]}</Text>
                <Text className="text-200 text-foreground">{currency}</Text>
                <Ionicons
                  name={openDropdown === 'currency' ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="hsl(60, 3%, 47%)"
                />
              </TouchableOpacity>
              {openDropdown === 'currency' && (
                <View
                  className="absolute right-0 top-full mt-200 min-w-[120px] rounded-400 border border-grey1 bg-background shadow-lg"
                  style={{ zIndex: 9999 }}>
                  {currencies.map((c, index) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => handleCurrencyChange(c)}
                      className={`flex-row items-center gap-200 px-500 py-300 ${index < currencies.length - 1 ? 'border-b border-grey1' : ''} ${index === 0 ? 'rounded-t-400' : ''} ${index === currencies.length - 1 ? 'rounded-b-400' : ''}`}>
                      <Text className="text-200 text-foreground">{CURRENCY_SYMBOLS[c]}</Text>
                      <Text className="text-200 text-foreground">{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Export Section Card */}
        <View className="mb-400 rounded-600 border border-grey1 bg-background-sec">
          {/* Export Dropdown Header */}
          <TouchableOpacity
            onPress={() => toggleDropdown('export')}
            className="flex-row items-center justify-between border-b border-grey1 p-350">
            <Text className="text-300 text-foreground">Export</Text>
            <Ionicons
              name={openDropdown === 'export' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="hsl(60, 3%, 47%)"
            />
          </TouchableOpacity>

          {/* Export All Data Row */}
          <View className="flex-row items-center justify-between border-b border-grey1 p-350">
            <Text className="text-300 text-foreground">Export All Data</Text>
            <TouchableOpacity
              onPress={handleExport}
              className="flex-row items-center gap-200 rounded-400 bg-primary px-500 py-300">
              <Ionicons name="document-outline" size={16} color="white" />
              <Text className="text-200 font-medium text-primary-fg">Export</Text>
            </TouchableOpacity>
          </View>

          {/* Export Format Row */}
          <View className="flex-row items-center justify-between p-350">
            <Text className="text-300 text-foreground">Export Format</Text>
            <View className="relative">
              <TouchableOpacity
                onPress={() => toggleDropdown('format')}
                className="flex-row items-center gap-300 rounded-400 bg-grey1 px-500 py-300">
                <Text className="text-200 font-medium text-foreground">{exportFormat}</Text>
                <Ionicons
                  name={openDropdown === 'format' ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="hsl(60, 3%, 47%)"
                />
              </TouchableOpacity>
              {openDropdown === 'format' && (
                <View
                  className="absolute right-0 top-full mt-200 min-w-[100px] rounded-400 border border-grey1 bg-background shadow-lg"
                  style={{ zIndex: 9999 }}>
                  {formats.map((f, index) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => handleExportFormatChange(f)}
                      className={`px-500 py-300 ${index < formats.length - 1 ? 'border-b border-grey1' : ''} ${index === 0 ? 'rounded-t-400' : ''} ${index === formats.length - 1 ? 'rounded-b-400' : ''}`}>
                      <Text className="text-200 text-foreground">{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Security Section Card */}
        <View className="rounded-600 border border-grey1 bg-background-sec">
          {/* Security Dropdown Header */}
          <TouchableOpacity
            onPress={() => toggleDropdown('security')}
            className="flex-row items-center justify-between border-b border-grey1 p-350">
            <Text className="text-300 text-danger">Security</Text>
            <Ionicons
              name={openDropdown === 'security' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="hsl(60, 3%, 47%)"
            />
          </TouchableOpacity>

          {/* Delete All Data Row */}
          <View className="flex-row items-center justify-between p-350">
            <Text className="text-300 text-foreground">Delete All Data</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch {}
                setShowDeleteModal(true);
              }}
              className="flex-row items-center gap-200 rounded-400 bg-danger px-500 py-300">
              <Ionicons name="trash-outline" size={16} color="white" />
              <Text className="text-200 font-medium text-danger-fg">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowDeleteModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-600 bg-background p-500">
              <View className="mx-auto mb-500 h-1 w-12 rounded-full bg-grey1" />

              <View className="gap-400">
                <Text className="text-300 text-foreground">
                  Are you sure you want to delete all your data. This action cannot be undone?
                </Text>

                <View className="gap-200 pl-500">
                  <Text className="text-200 text-muted">
                    • All your wishes ({wishes.length} items)
                  </Text>
                  <Text className="text-200 text-muted">• All settings</Text>
                </View>

                <View className="gap-300 pt-300">
                  <TouchableOpacity
                    onPress={handleDelete}
                    className="w-full flex-row items-center justify-center gap-200 rounded-400 bg-transparent px-500 py-350">
                    <Ionicons name="trash-outline" size={18} color="hsl(13, 82%, 58%)" />
                    <Text className="text-300 font-medium text-danger">
                      Delete All Data Permanently
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowDeleteModal(false)}
                    className="w-full flex-row items-center justify-center gap-200 rounded-400 bg-transparent px-500 py-350">
                    <Ionicons name="close" size={18} color="hsl(46, 6%, 24%)" />
                    <Text className="text-300 font-medium text-foreground">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
