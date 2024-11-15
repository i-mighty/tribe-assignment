import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import { Message } from '~/components/chat/Message';
import { MessageInput } from '~/components/chat/MessageInput';
import { ParticipantBottomSheet } from '~/components/chat/ParticipantBottomSheet';
import { ReactionBottomSheet } from '~/components/chat/ReactionBottomSheet';
import { Text } from '~/components/ui/text';
import { api } from '~/lib/api';
import { useChatStore } from '~/lib/store';
import type { TMessage, TParticipant } from '~/types/chat';
import { useNetworkStatus } from '~/lib/useNetworkStatus';

const POLLING_INTERVAL = 3000; // 3 seconds

export default function ChatScreen() {
  const [selectedMessage, setSelectedMessage] = React.useState<TMessage | null>(null);
  const [selectedParticipant, setSelectedParticipant] = React.useState<TParticipant | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = React.useState<TMessage | null>(null);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true);
  
  const reactionsSheetRef = React.useRef<BottomSheetModal>(null);
  const participantSheetRef = React.useRef<BottomSheetModal>(null);
  
  const { 
    messages, 
    participants, 
    setMessages, 
    addMessages,
    setParticipants,
    updateMessages,
    updateParticipants,
    lastUpdateTimestamp,
    setLastUpdateTimestamp,
    serverInfo,
    setServerInfo
  } = useChatStore();

  const isOnline = useNetworkStatus();
  
  const participantMap = React.useMemo(() => {
    return participants.reduce((acc, participant) => {
      acc[participant.uuid] = participant;
      return acc;
    }, {} as Record<string, TParticipant>);
  }, [participants]);

  const getParticipant = React.useCallback((uuid: string) => {
    return participantMap[uuid];
  }, [participantMap]);

  const handleAddReaction = React.useCallback(async (messageId: string, reaction: string) => {
    if (!isOnline) {
      // Handle offline case if needed
      return;
    }

    try {
      // You'll need to add this endpoint to your API
      const updatedMessage = await api.addReaction(messageId, reaction);
      updateMessages([updatedMessage]);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [isOnline, updateMessages]);

  const renderMessage = React.useCallback(({ item }: { item: TMessage & { isPending?: boolean } }) => {
    const participant = getParticipant(item.authorUuid);
    if (!participant) return null;

    return (
      <Message
        message={item}
        participant={participant}
        showHeader={true}
        onPressImage={(imageUrl) => setSelectedImage(imageUrl)}
        onPressReactions={(message) => {
          setSelectedMessage(message);
          reactionsSheetRef.current?.present();
        }}
        onPressParticipant={(participant) => {
          setSelectedParticipant(participant);
          participantSheetRef.current?.present();
        }}
        onLongPress={() => handleLongPressMessage(item)}
      />
    );
  }, [getParticipant]);

  const preparedMessages = React.useMemo(() => {
    const allMessages = [
      ...messages,
      ...useChatStore.getState().pendingMessages,
    ].sort((a, b) => b.sentAt - a.sentAt); // Changed to sort oldest to newest

    const prepared: Array<TMessage & { type: 'message' | 'date'; dateString?: string }> = [];
    
    allMessages.forEach((message, index) => {
      // Add the message first
      prepared.push({
        ...message,
        type: 'message',
      });

      // Check if we need to add a date separator
      const currentDate = new Date(message.sentAt).setHours(0, 0, 0, 0);
      const nextMessage = allMessages[index + 1];
      
      if (nextMessage) {
        const nextDate = new Date(nextMessage.sentAt).setHours(0, 0, 0, 0);
        
        // If dates are different, add a separator
        if (currentDate !== nextDate) {
          prepared.push({
            ...message,
            type: 'date',
            dateString: format(nextMessage.sentAt, 'EEEE, MMMM do, yyyy'),
          });
        }
      }
    });

    return prepared;
  }, [messages]);

  const renderDateSeparator = React.useCallback((dateString: string) => {
    return (
      <View className="py-2 px-4">
        <Text className="text-center text-xs text-muted-foreground">
          {dateString}
        </Text>
      </View>
    );
  }, []);

  const renderItem = React.useCallback(({ 
    item 
  }: { 
    item: TMessage & { type: 'message' | 'date'; dateString?: string }
  }) => {
    if (item.type === 'date' && item.dateString) {
      return renderDateSeparator(item.dateString);
    }
    return renderMessage({ item });
  }, [renderMessage, renderDateSeparator]);

  const loadInitialData = React.useCallback(async () => {
    try {
      const info = await api.getInfo();
      setServerInfo(info);
      
      const [messagesData, participantsData] = await Promise.all([
        api.getLatestMessages(),
        api.getAllParticipants(),
      ]);
      
      setMessages(messagesData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, []);

  const pollUpdates = React.useCallback(async () => {
    try {
      const [messageUpdates, participantUpdates] = await Promise.all([
        api.getMessageUpdates(lastUpdateTimestamp),
        api.getParticipantUpdates(lastUpdateTimestamp),
      ]);

      if (messageUpdates.length > 0) {
        updateMessages(messageUpdates);
      }
      
      if (participantUpdates.length > 0) {
        updateParticipants(participantUpdates);
      }

      setLastUpdateTimestamp(Date.now());
    } catch (error) {
      console.error('Failed to poll updates:', error);
    }
  }, [lastUpdateTimestamp]);

  const loadMoreMessages = React.useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore || !messages.length || !isOnline) return;

    try {
      setIsLoadingMore(true);
      // Get the oldest message's UUID
      const oldestMessage = messages[messages.length - 1];
      const olderMessages = await api.getOlderMessages(oldestMessage.uuid);
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      // Use addMessages instead of setMessages
      addMessages(olderMessages);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [messages, isLoadingMore, hasMoreMessages, isOnline, addMessages]);

  const renderFooter = React.useCallback(() => {
    if (!hasMoreMessages) return null;
    
    return (
      <View className="py-4 px-4">
        {isLoadingMore ? (
          <Text className="text-center text-muted-foreground">Loading more messages...</Text>
        ) : null}
      </View>
    );
  }, [isLoadingMore, hasMoreMessages]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  React.useEffect(() => {
    const interval = setInterval(pollUpdates, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [pollUpdates]);

  const handleLongPressMessage = (message: TMessage) => {
    setReplyToMessage(message);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: 100, // approximate height of a message
    offset: 100 * index,
    index,
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {!isOnline && (
        <View className="bg-destructive px-4 py-2">
          <Text className="text-destructive-foreground text-center">
            You're offline. Messages will be sent when you're back online.
          </Text>
        </View>
      )}
      
      <FlatList
        data={preparedMessages}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.uuid}`}
        inverted
        ListEmptyComponent={() => (
          <View className="p-4">
            <Text className="text-center text-muted-foreground">No messages yet</Text>
          </View>
        )}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshing={isLoadingMore}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: messages.length, // Prevent auto-scrolling
        }}
      />
      
      <MessageInput 
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
      />

      <ReactionBottomSheet
        message={selectedMessage}
        bottomSheetRef={reactionsSheetRef}
      />

      <ParticipantBottomSheet
        participant={selectedParticipant}
        bottomSheetRef={participantSheetRef}
      />

      <ImageView
        images={selectedImage ? [{ uri: selectedImage }] : []}
        imageIndex={0}
        visible={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
      />
    </SafeAreaView>
  );
}
