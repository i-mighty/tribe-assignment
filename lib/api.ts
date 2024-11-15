import type { ServerInfo, TMessage, TParticipant } from '~/types/chat';

const API_BASE = 'http://dummy-chat-server.tribechat.pro/api';

export const api = {
  async getInfo(): Promise<ServerInfo> {
    const response = await fetch(`${API_BASE}/info`);
    return response.json();
  },

  async getAllMessages(): Promise<TMessage[]> {
    const response = await fetch(`${API_BASE}/messages/all`);
    return response.json();
  },

  async getLatestMessages(): Promise<TMessage[]> {
    const response = await fetch(`${API_BASE}/messages/latest`);
    return response.json();
  },

  async getOlderMessages(refMessageUuid: string): Promise<TMessage[]> {
    const response = await fetch(`${API_BASE}/messages/older/${refMessageUuid}`);
    return response.json();
  },

  async getMessageUpdates(timestamp: number): Promise<TMessage[]> {
    const response = await fetch(`${API_BASE}/messages/updates/${timestamp}`);
    return response.json();
  },

  async sendMessage(text: string): Promise<TMessage> {
    const response = await fetch(`${API_BASE}/messages/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    return response.json();
  },

  async getAllParticipants(): Promise<TParticipant[]> {
    const response = await fetch(`${API_BASE}/participants/all`);
    return response.json();
  },

  async getParticipantUpdates(timestamp: number): Promise<TParticipant[]> {
    const response = await fetch(`${API_BASE}/participants/updates/${timestamp}`);
    return response.json();
  },

  async addReaction(messageId: string, reaction: string): Promise<TMessage> {
    const response = await fetch(`${API_BASE}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: reaction }),
    });
    return response.json();
  },
}; 