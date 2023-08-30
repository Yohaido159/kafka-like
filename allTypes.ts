export type Message = {
  topic: string;
  message: string;
  partition: number;
  offset: number;
};

export type Topic = {
  [key: string]: Message[];
};

export type Partition = {
  [key: number]: Topic;
};

export interface DataStorage {
  add({ topic, partition, value }: { topic: string; partition: number; value: Message }): void;
  get({ topic, partition, offset }: { topic: string; partition: number; offset?: number }): Message[];
  remove({ topic, partition, offset }: { topic: string; partition: number; offset: number }): void;
}

export interface Strategy {
  call({
    broker,
    topic,
    partition,
    offset,
  }: {
    broker: IBroker;
    topic: string;
    partition: number;
    offset: number;
  }): Message[];
  ack({
    broker,
    topic,
    partition,
    offset,
  }: {
    broker: IBroker;
    topic: string;
    partition: number;
    offset: number;
  }): void;
}

export interface IBroker {
  addMessage({ topic, message, partition }: { topic: string; message: string; partition: number }): void;
  pollForMessages({ topic, partition, offset }: { topic: string; partition: number; offset: number }): Message[];
  ack({ topic, partition, offset }: { topic: string; partition: number; offset: number }): void;
}

export interface ICoordinator {
  attachBrokerToTopic({ topic, broker }: { topic: string; broker: IBroker }): void;
  getBrokerForTopic({ topic }: { topic: string }): IBroker;
}

export interface IStateStorage {
  getCurrentOffset(): number;
  setCurrentOffset(offset: number): void;
}
