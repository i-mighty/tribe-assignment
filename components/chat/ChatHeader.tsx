import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme } from '~/lib/useColorScheme';

export function ChatHeader() {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ paddingTop: insets.top }}
      className={`border-b ${
        isDarkColorScheme ? 'border-zinc-800 bg-background' : 'border-border bg-background'
      }`}
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-lg font-semibold">Tribe Chat</Text>
          <Text className="text-sm text-muted-foreground">Assignment</Text>
        </View>
        <ThemeToggle />
      </View>
    </View>
  );
} 