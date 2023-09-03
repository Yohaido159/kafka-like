import { IBroker, IConsumer, Message, IStrategy, IProducer, IStateStorage } from './allTypes';

export class AtMostOnce implements IStrategy {
  public stateStorage: IStateStorage;
  constructor({ stateStorage }: { stateStorage: IStateStorage }) {
    this.stateStorage = stateStorage;
  }

  async sendMessage({ topic, message, broker }: { topic: string; message: string; broker: IBroker }): Promise<void> {
    // Just send the message without waiting for any acknowledgment.
    return await broker.addMessage({ topic, message });
  }

  async pullMessages({
    broker,
    topic,
    consumerId,
  }: {
    broker: IBroker;
    topic: string;
    consumerId: string;
  }): Promise<Message[]> {
    // Pull messages and do not re-pull them.
    const offset = this.stateStorage.getOffset({ topic, consumerId });
    this.stateStorage.setOffset({ topic, consumerId, offset: offset + 1 });
    return await broker.pollForMessages({ topic, offset });
  }
}

const retry = async (fn: any, retries = 3, interval = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      return await retry(fn, retries - 1, interval);
    } else {
      throw error;
    }
  }
};

export class AtLeastOnce implements IStrategy {
  public stateStorage: IStateStorage;
  constructor({ stateStorage }: { stateStorage: IStateStorage }) {
    this.stateStorage = stateStorage;
  }

  async sendMessage({ topic, message, broker }: { topic: string; message: string; broker: IBroker }): Promise<void> {
    return await retry(async () => {
      await broker.addMessage({ topic, message });
    });
  }

  async pullMessages({
    broker,
    topic,
    consumerId,
  }: {
    broker: IBroker;
    topic: string;
    consumerId: string;
  }): Promise<Message[]> {
    // Pull messages and possibly re-pull them until acknowledged.
    return await retry(async () => {
      const offset = this.stateStorage.getOffset({ topic, consumerId });
      const messages = await broker.pollForMessages({ topic, offset });
      this.stateStorage.setOffset({ topic, consumerId, offset: offset + 1 });
      return messages;
    });
  }
}
