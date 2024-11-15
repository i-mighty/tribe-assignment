import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { TMessage, TParticipant } from '~/types/chat';
import { useChatStore } from '~/lib/store';
import { useColorScheme } from '~/lib/useColorScheme';

interface ReactionBottomSheetProps {
  message: TMessage | null;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export function ReactionBottomSheet({ message, bottomSheetRef }: ReactionBottomSheetProps) {
  const participants = useChatStore((state) => state.participants);
  const { isDarkColorScheme } = useColorScheme();

  const getParticipant = (uuid: string) => {
    return participants.find((p) => p.uuid === uuid);
  };

  if (!message) return null;

  const groupedReactions = message.reactions.reduce((acc, reaction) => {
    const key = reaction.value;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(reaction);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%']}
      index={0}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: isDarkColorScheme ? 'hsl(var(--background))' : 'hsl(var(--background))',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: isDarkColorScheme ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
      handleIndicatorStyle={{
        backgroundColor: isDarkColorScheme ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.5,
      }}
    >
      <BottomSheetView className="flex-1 bg-background rounded-t-[20px]">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-lg font-semibold">Reactions</Text>
        </View>
        <View className="flex-1 px-4">
          {Object.entries(groupedReactions).map(([value, reactions]) => (
            <View key={value} className="mb-4">
              <View className="flex-row items-center mb-2 py-2 border-b border-border">
                <Text className="text-xl mr-2">{value}</Text>
                <Text className="text-sm text-muted-foreground">
                  {reactions.length} {reactions.length === 1 ? 'reaction' : 'reactions'}
                </Text>
              </View>
              {reactions.map((reaction) => {
                const participant = getParticipant(reaction.participantUuid);
                if (!participant) return null;

                return (
                  <View
                    key={reaction.uuid}
                    className="flex-row items-center space-x-3 py-2 pl-4"
                  >
                    <Avatar alt={`${participant.name}'s avatar`}>
                      <AvatarImage source={{ uri: participant.avatarUrl }} />
                      <AvatarFallback>
                        {participant.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <View className="flex-1">
                      <Text className="font-medium">{participant.name}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 