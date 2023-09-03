export type Message = {
  topic: string;
  message: string;
  offset: number;
  id?: string;
};

export type Topic = {
  [key: string]: Message[];
};

export interface DataStorage {
  add({ topic, value }: { topic: string; value: Message }): void;
  get({ topic, offset }: { topic: string; offset?: number }): Message[];
  remove({ topic, offset }: { topic: string; offset: number }): void;
}

type StrategyAck = {
  broker: IBroker;
  topic: string;
  offset: number;
};

type StrategyCall = {
  consumer: IConsumer;
  messages: Message[];
};

export interface Strategy {
  call({ consumer, messages }: StrategyCall): Message[];
  ack({ broker, topic, offset }: StrategyAck): void;
}

export interface IBroker {
  addMessage({ topic, message }: { topic: string; message: string }): Promise<void>;
  pollForMessages({ topic, offset }: { topic: string; offset: number }): Promise<Message[]>;
}

export interface ICoordinator {
  attachBrokerToTopic({ topic, broker }: { topic: string; broker: IBroker }): void;
  getBrokerForTopic({ topic }: { topic: string }): IBroker;
  getHashFormString({ string }: { string: string }): number;
}

export interface IStateStorage {
  setOffset({ topic, offset, consumerId }: { topic: string; offset: number; consumerId: string }): void;
  getOffset({ topic, consumerId }: { topic: string; consumerId: string }): number;
}

export interface IConsumer {
  pullMessages({ topic, offset }: { topic: string; offset?: number }): Promise<Message[]>;
}

export interface IProducer {
  send({ topic, message }: { topic: string; message: string }): Promise<void>;
}

export interface IStrategy {
  sendMessage({ topic, message, broker }: { topic: string; message: string; broker: IBroker }): Promise<void>;
  pullMessages({
    broker,
    topic,
    consumerId,
  }: {
    broker: IBroker;
    topic: string;
    consumerId: string;
  }): Promise<Message[]>;
}
