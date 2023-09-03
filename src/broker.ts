import { DataStorage, IBroker } from './allTypes';

export class Broker implements IBroker {
  public dataStorage: DataStorage;

  constructor({ dataStorage }: { dataStorage: DataStorage }) {
    this.dataStorage = dataStorage;
  }

  async addMessage({ topic, message }: { topic: string; message: string }) {
    try {
      this.dataStorage.add({
        topic,
        value: {
          topic,
          message,
          offset: this.dataStorage.get({ topic }).length,
        },
      });
    } catch (error) {}
  }

  async pollForMessages({ topic, offset }: { topic: string; offset: number }) {
    const messages = this.dataStorage.get({ topic, offset });
    return messages;
  }
}
