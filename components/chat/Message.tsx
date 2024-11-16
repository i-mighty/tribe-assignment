import { format } from 'date-fns';
import * as React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Text } from '~/components/ui/text';
import type { TMessage, TParticipant } from '~/types/chat';
import { MessageReactions } from './MessageReactions';
import { useColorScheme } from '~/lib/useColorScheme';

interface MessageProps {
  message: TMessage;
  participant: TParticipant;
  showHeader?: boolean;
  onPressImage?: (imageUrl: string) => void;
  onPressReactions?: (message: TMessage) => void;
  onPressParticipant?: (participant: TParticipant) => void;
  onLongPress?: () => void;
}

export function Message({ 
  message, 
  participant, 
  showHeader = true,
  onPressImage,
  onPressReactions,
  onPressParticipant,
  onLongPress,
}: MessageProps) {
  const { isDarkColorScheme } = useColorScheme();
  
  const formatMessageTime = (timestamp: number) => {
    try {
      if (!timestamp || isNaN(timestamp)) {
        return '';
      }
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      console.error('Invalid timestamp:', timestamp);
      return '';
    }
  };

  const isCurrentUser = participant.uuid === 'you';
  const firstAttachment = message.attachments[0];

  return (
    <Pressable 
      onLongPress={onLongPress} 
      className={`px-4 py-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
    >
      {showHeader && !isCurrentUser && (
        <View className="flex-row items-center mb-1">
          <Avatar alt={`${participant.name}'s avatar`} className="mr-3">
            <AvatarImage source={{ uri: participant.avatarUrl }} />
            <AvatarFallback>
              {participant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Pressable onPress={() => onPressParticipant?.(participant)}>
            <Text className="font-semibold">{participant.name}</Text>
          </Pressable>
        </View>
      )}
      
      <View className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <View className={`rounded-2xl px-4 py-2.5 ${
          isCurrentUser 
            ? isDarkColorScheme 
              ? 'bg-zinc-800' 
              : 'bg-primary'
            : 'bg-muted border border-border'
        }`}>
          <Text className={
            isCurrentUser 
              ? isDarkColorScheme 
                ? 'text-zinc-100' 
                : 'text-primary-foreground'
              : 'text-foreground'
          }>
            {message.text}
          </Text>
          
          {firstAttachment?.type === 'image' && (
            <Pressable
              onPress={() => onPressImage?.(firstAttachment.url)}
              className="mt-2"
            >
              <Image
                source={{ uri: firstAttachment.url }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
            </Pressable>
          )}
          
          <View className="flex-row items-center justify-end space-x-2 mt-1">
            <Text className={`text-xs ${
              isCurrentUser 
                ? isDarkColorScheme 
                  ? 'text-zinc-300' 
                  : 'text-primary-foreground/70'
                : 'text-muted-foreground'
            }`}>
              {formatMessageTime(message.sentAt)}
            </Text>
            {message.updatedAt > message.sentAt && (
              <Text className={`text-xs ${
                isCurrentUser 
                  ? isDarkColorScheme 
                    ? 'text-zinc-300' 
                    : 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              }`}>
                (edited)
              </Text>
            )}
          </View>
        </View>
        
        {message.reactions.length > 0 && (
          <Pressable
            onPress={() => onPressReactions?.(message)}
            className="mt-2"
          >
            <MessageReactions reactions={message.reactions} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
} 