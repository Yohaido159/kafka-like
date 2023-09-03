import fs from 'fs';
import path from 'path';

import { DataStorage, Message } from './allTypes';
export class InMemoryDataStorage implements DataStorage {
  private topics: { [key: string]: Message[] } = {};

  add({ topic, value }: { topic: string; value: Message }) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(value);
  }

  get({ topic, offset }: { topic: string; offset?: number }) {
    if (!this.topics[topic]) {
      return [];
    }

    if (!this.topics[topic]) {
      return [];
    }

    let newMessages = [...this.topics[topic]];
    offset && (newMessages = newMessages.slice(offset));
    return newMessages;
  }

  remove({ topic, offset }: { topic: string; offset: number }) {
    if (!this.topics[topic]) {
      return;
    }

    if (!this.topics[topic]) {
      return;
    }

    this.topics[topic] = this.topics[topic].filter((message) => message.offset !== offset);
  }
}
