import { IStateStorage } from './allTypes';

export type TopicState = {
  [key: string]: {
    offset: number;
  };
};

export class StateStorage implements IStateStorage {
  private topics: { [key: string]: TopicState } = {};

  constructor() {
    this.topics = {};
  }

  setOffset({ topic, consumerId, offset }: { topic: string; consumerId: string; offset: number }) {
    if (!this.topics[topic]) {
      this.topics[topic] = {};
    }

    if (!this.topics[topic][consumerId]) {
      this.topics[topic][consumerId] = { offset };
    }

    this.topics[topic][consumerId].offset = offset;
  }

  getOffset({ topic, consumerId }: { topic: string; consumerId: string }): number {
    return this.topics[topic] && this.topics[topic][consumerId] ? this.topics[topic][consumerId].offset : 0;
  }
}
