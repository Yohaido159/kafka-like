import { DataStorage, Message } from './allTypes';

export class InMemoryDataStorage implements DataStorage {
  private topics: { [key: string]: { [key: number]: Message[] } } = {};

  add({ topic, partition, value }: { topic: string; partition: number; value: Message }) {
    if (!this.topics[topic]) {
      this.topics[topic] = {};
    }

    if (!this.topics[topic][partition]) {
      this.topics[topic][partition] = [];
    }

    this.topics[topic][partition].push(value);
  }

  get({ topic, partition, offset }: { topic: string; partition: number; offset: number }) {
    if (!this.topics[topic]) {
      return [];
    }

    if (!this.topics[topic][partition]) {
      return [];
    }

    let newMessages = [...this.topics[topic][partition]];
    offset && (newMessages = newMessages.slice(offset));
    return newMessages;
  }

  remove({ topic, partition, offset }: { topic: string; partition: number; offset: number }) {
    if (!this.topics[topic]) {
      return;
    }

    if (!this.topics[topic][partition]) {
      return;
    }

    this.topics[topic][partition] = this.topics[topic][partition].filter((message) => message.offset !== offset);
  }
}
