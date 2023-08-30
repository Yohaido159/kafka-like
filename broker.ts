import { DataStorage, Partition } from './allTypes';

export class Broker {
  private topics: Partition = {};
  private dataStorage: DataStorage;

  constructor({ partitionsCount, dataStorage }: { partitionsCount: number; dataStorage: DataStorage }) {
    for (let i = 0; i < partitionsCount; i++) {
      this.topics[i] = {};
    }

    this.dataStorage = dataStorage;
  }

  addMessage({ topic, message, partition }: { topic: string; message: string; partition: number }) {
    if (!Number.isInteger(partition)) {
      throw new Error('partition is required');
    }

    this.dataStorage.add({
      topic,
      partition,
      value: {
        topic,
        message,
        partition,
        offset: this.dataStorage.get({ topic, partition }).length,
      },
    });
  }

  pollForMessages({ topic, partition, offset }: { topic: string; partition: number; offset: number }) {
    const messages = this.dataStorage.get({ topic, partition, offset });
    return messages;
  }

  ack({ topic, partition, offset }: { topic: string; partition: number; offset: number }) {
    this.dataStorage.remove({ topic, partition, offset });
  }
}
