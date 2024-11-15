import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import type { TParticipant } from '~/types/chat';
import { useColorScheme } from '~/lib/useColorScheme';

interface ParticipantBottomSheetProps {
  participant: TParticipant | null;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export function ParticipantBottomSheet({ 
  participant, 
  bottomSheetRef 
}: ParticipantBottomSheetProps) {
  const { isDarkColorScheme } = useColorScheme();
  
  if (!participant) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['40%']}
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
          <Text className="text-lg font-semibold">Profile</Text>
        </View>
        <View className="flex-1 px-4 py-4">
          <View className="items-center space-y-4">
            <Avatar alt={`${participant.name}'s avatar`} className="h-20 w-20">
              <AvatarImage source={{ uri: participant.avatarUrl }} />
              <AvatarFallback>
                {participant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <View className="items-center space-y-1">
              <Text className="text-xl font-semibold">{participant.name}</Text>
              {participant.jobTitle && (
                <Text className="text-base text-muted-foreground">{participant.jobTitle}</Text>
              )}
            </View>
            {participant.bio && (
              <View className="bg-muted/50 rounded-lg p-4 w-full">
                <Text className="text-sm text-center text-foreground">{participant.bio}</Text>
              </View>
            )}
            <View className="flex-row items-center space-x-2 pt-2">
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
              <Text className="text-xs text-muted-foreground">
                Member since {format(participant.createdAt, 'PP')}
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
} 