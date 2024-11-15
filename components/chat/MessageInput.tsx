import { Send, X, AtSign } from 'lucide-react-native';
import * as React from 'react';
import { TextInput, View, Pressable, ScrollView } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useChatStore } from '~/lib/store';
import { api } from '~/lib/api';
import type { TMessage, TParticipant } from '~/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

interface MessageInputProps {
  replyToMessage?: TMessage | null;
  onCancelReply?: () => void;
}

export function MessageInput({ replyToMessage, onCancelReply }: MessageInputProps) {
  const [text, setText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [cursorPosition, setCursorPosition] = React.useState(0);
  
  const participants = useChatStore((state) => state.participants);
  const addMessages = useChatStore((state) => state.addMessages);
  const addPendingMessage = useChatStore((state) => state.addPendingMessage);
  const pendingMessages = useChatStore((state) => state.pendingMessages);
  const isOnline = useChatStore((state) => state.isOnline);

  const filteredParticipants = React.useMemo(() => {
    if (!mentionQuery) return participants;
    return participants.filter(p => 
      p.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );
  }, [participants, mentionQuery]);

  const handleChangeText = (value: string) => {
    setText(value);
    
    // Check if we should show mentions
    const lastAtSymbol = value.lastIndexOf('@', cursorPosition);
    if (lastAtSymbol !== -1) {
      const query = value.slice(lastAtSymbol + 1, cursorPosition);
      setMentionQuery(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMention = (participant: TParticipant) => {
    const lastAtSymbol = text.lastIndexOf('@', cursorPosition);
    const newText = 
      text.slice(0, lastAtSymbol) + 
      `@${participant.name} ` + 
      text.slice(cursorPosition);
    
    setText(newText);
    setShowMentions(false);
  };

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    
    const messageData = {
      text,
      replyToMessageUuid: replyToMessage?.uuid,
    };

    if (!isOnline) {
      addPendingMessage(messageData);
      setText('');
      onCancelReply?.();
      return;
    }
    
    setIsSending(true);
    try {
      const message = await api.sendMessage(text);
      addMessages([message]);
      setText('');
      onCancelReply?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      addPendingMessage(messageData);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View>
      {replyToMessage && (
        <View className="px-4 py-2 border-t border-border flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">Replying to</Text>
            <Text className="text-sm" numberOfLines={1}>{replyToMessage.text}</Text>
          </View>
          <Pressable onPress={onCancelReply} className="ml-2">
            <X className="h-5 w-5 text-muted-foreground" />
          </Pressable>
        </View>
      )}
      
      {showMentions && (
        <>
          <Pressable 
            className="absolute inset-0 bg-foreground/10" 
            onPress={() => setShowMentions(false)}
          />
          <View className="relative bg-card border-t border-border">
            <View className="flex-row items-center justify-between p-3 border-b border-border">
              <Text className="text-sm font-medium text-muted-foreground">
                Mention someone
              </Text>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => setShowMentions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </View>
            <ScrollView 
              className="max-h-48"
              keyboardShouldPersistTaps="always"
            >
              {filteredParticipants.map(participant => (
                <Pressable
                  key={participant.uuid}
                  onPress={() => handleMention(participant)}
                  className="flex-row items-center p-3 active:bg-muted"
                >
                  <Avatar alt={`${participant.name}'s avatar`} className="mr-3">
                    <AvatarImage source={{ uri: participant.avatarUrl }} />
                    <AvatarFallback>
                      {participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1 space-y-0.5">
                    <Text className="font-medium">{participant.name}</Text>
                    {participant.jobTitle && (
                      <Text className="text-xs text-muted-foreground">
                        {participant.jobTitle}
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm text-muted-foreground ml-3">@{participant.name}</Text>
                </Pressable>
              ))}
              {filteredParticipants.length === 0 && (
                <View className="p-4">
                  <Text className="text-center text-muted-foreground">
                    No participants found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </>
      )}
      
      <View className="flex-row items-center p-4 border-t border-border bg-background">
        <Button
          variant="ghost"
          size="icon"
          onPress={() => setShowMentions(true)}
          className="mr-2"
        >
          <AtSign className={showMentions ? "h-4 w-4 text-primary" : "h-4 w-4"} />
        </Button>
        <TextInput
          className="flex-1 mr-2 px-4 py-2.5 bg-muted rounded-full text-base"
          placeholder="Type a message..."
          value={text}
          onChangeText={handleChangeText}
          onSelectionChange={(event) => {
            setCursorPosition(event.nativeEvent.selection.start);
          }}
          onSubmitEditing={handleSend}
          multiline
        />
        <Button
          variant="default"
          size="icon"
          onPress={handleSend}
          disabled={!text.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </View>
    </View>
  );
} 