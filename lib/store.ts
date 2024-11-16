import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { uniqBy } from 'lodash';
import type { ServerInfo, TMessage, TParticipant } from '~/types/chat';

// Mock data for testing
const MOCK_PARTICIPANTS: TParticipant[] = [
  {
    uuid: 'you',
    name: 'You',
    avatarUrl: 'https://github.com/shadcn.png',
    bio: 'Frontend Developer',
    jobTitle: 'Senior Developer',
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    updatedAt: Date.now(),
  },
  {
    uuid: 'user1',
    name: 'John Doe',
    avatarUrl: 'https://github.com/shadcn.png',
    bio: 'UI/UX Designer',
    jobTitle: 'Design Lead',
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    updatedAt: Date.now(),
  },
  {
    uuid: 'user2',
    name: 'Jane Smith',
    avatarUrl: 'https://github.com/shadcn.png',
    bio: 'Product Manager',
    jobTitle: 'Senior PM',
    createdAt: Date.now() - 86400000 * 45, // 45 days ago
    updatedAt: Date.now(),
  },
];

const MOCK_MESSAGES: TMessage[] = [
  {
    uuid: 'msg1',
    text: 'Hello everyone! 👋',
    authorUuid: 'user1',
    sentAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    attachments: [],
    reactions: [
      {
        uuid: 'reaction1',
        value: '👋',
        authorUuid: 'user2',
        timestamp: Date.now() - 7100000,
      },
      {
        uuid: 'reaction2',
        value: '❤️',
        authorUuid: 'you',
        timestamp: Date.now() - 7000000,
      }
    ],
  },
  {
    uuid: 'msg2',
    text: 'Hi John! How are you?',
    authorUuid: 'user2',
    sentAt: Date.now() - 7000000,
    updatedAt: Date.now() - 7000000,
    attachments: [],
    reactions: [],
    replyToMessageUuid: 'msg1',
  },
  {
    uuid: 'msg3',
    text: "Check out this cool image!",
    authorUuid: 'user1',
    sentAt: Date.now() - 6800000,
    updatedAt: Date.now() - 6800000,
    attachments: [
      {
        uuid: 'att1',
        type: 'image',
        url: 'https://picsum.photos/400/300',
        width: 400,
        height: 300,
      }
    ],
    reactions: [
      {
        uuid: 'reaction3',
        value: '❤️',
        authorUuid: 'user2',
        timestamp: Date.now() - 6700000,
      },
      {
        uuid: 'reaction4',
        value: '👍',
        authorUuid: 'you',
        timestamp: Date.now() - 6600000,
      },
    ],
  },
];

interface ChatStore {
  serverInfo: ServerInfo | null;
  messages: TMessage[];
  participants: TParticipant[];
  lastUpdateTimestamp: number;
  pendingMessages: TMessage[];
  isOnline: boolean;
  setServerInfo: (info: ServerInfo) => void;
  setMessages: (messages: TMessage[]) => void;
  addMessages: (messages: TMessage[]) => void;
  updateMessages: (messages: TMessage[]) => void;
  setParticipants: (participants: TParticipant[]) => void;
  updateParticipants: (participants: TParticipant[]) => void;
  setLastUpdateTimestamp: (timestamp: number) => void;
  addPendingMessage: (message: { text: string; replyToMessageUuid?: string }) => void;
  removePendingMessage: (localId: string) => void;
  setIsOnline: (isOnline: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      serverInfo: null,
      messages: MOCK_MESSAGES,
      participants: MOCK_PARTICIPANTS,
      lastUpdateTimestamp: Date.now(),
      pendingMessages: [],
      isOnline: true,
      setServerInfo: (info) => set({ serverInfo: info }),
      setMessages: (messages) => set({ messages }),
      addMessages: (newMessages) =>
        set((state) => ({
          messages: uniqBy([...state.messages, ...newMessages], 'uuid')
            .sort((a, b) => a.sentAt - b.sentAt)
        })),
      updateMessages: (messages) =>
        set((state) => ({
          messages: state.messages.map((msg) => {
            const updatedMsg = messages.find((m) => m.uuid === msg.uuid);
            return updatedMsg || msg;
          }),
        })),
      setParticipants: (participants) => set({ participants }),
      updateParticipants: (participants) =>
        set((state) => ({
          participants: state.participants.map((p) => {
            const updatedParticipant = participants.find((up) => up.uuid === p.uuid);
            return updatedParticipant || p;
          }),
        })),
      setLastUpdateTimestamp: (timestamp) => set({ lastUpdateTimestamp: timestamp }),
      addPendingMessage: (message) => 
        set((state) => ({
          pendingMessages: [...state.pendingMessages, {
            uuid: `local-${Date.now()}`,
            text: message.text,
            authorUuid: 'you',
            sentAt: Date.now(),
            updatedAt: Date.now(),
            attachments: [],
            reactions: [],
            replyToMessageUuid: message.replyToMessageUuid,
          }],
        })),
      removePendingMessage: (localId) =>
        set((state) => ({
          pendingMessages: state.pendingMessages.filter(msg => msg.uuid !== localId),
        })),
      setIsOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        participants: state.participants,
        lastUpdateTimestamp: state.lastUpdateTimestamp,
        pendingMessages: state.pendingMessages,
      }),
    }
  )
);
