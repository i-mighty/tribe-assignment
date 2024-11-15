import * as React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { TReaction } from '~/types/chat';

interface MessageReactionsProps {
  reactions: TReaction[];
}

export function MessageReactions({ reactions }: MessageReactionsProps) {
  console.log('Reactions received:', reactions);

  const groupedReactions = React.useMemo(() => {
    if (!Array.isArray(reactions)) {
      console.warn('Reactions is not an array:', reactions);
      return {};
    }

    return reactions.reduce((acc, reaction) => {
      console.log('Processing reaction:', reaction);
      
      if (!reaction || !reaction.value) {
        console.warn('Invalid reaction:', reaction);
        return acc;
      }
      
      const key = reaction.value;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reaction);
      return acc;
    }, {} as Record<string, TReaction[]>);
  }, [reactions]);

  console.log('Grouped reactions:', groupedReactions);

  if (!reactions || reactions.length === 0 || Object.keys(groupedReactions).length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap gap-2 mt-1">
      {Object.entries(groupedReactions).map(([value, valueReactions]) => (
        <View
          key={value}
          className="flex-row items-center bg-muted/80 px-2 py-1 rounded-full"
        >
          <Text className="text-base">{value}</Text>
          <Text className="ml-1 text-xs text-muted-foreground">
            {valueReactions.length}
          </Text>
        </View>
      ))}
    </View>
  );
} 