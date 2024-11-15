import * as React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';

const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🙏'];

interface ReactionPickerProps {
  onSelectReaction: (reaction: string) => void;
}

export function ReactionPicker({ onSelectReaction }: ReactionPickerProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2 border-t border-border"
    >
      {AVAILABLE_REACTIONS.map((reaction) => (
        <Pressable
          key={reaction}
          onPress={() => onSelectReaction(reaction)}
          className="px-2 py-1 mx-1"
        >
          <Text className="text-2xl">{reaction}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
} 