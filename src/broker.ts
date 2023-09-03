import { DataStorage, Partition } from './allTypes';

export class Broker {
  private dataStorage: DataStorage;
  public partitionCount: number;

  constructor({ dataStorage, partitionCount }: { dataStorage: DataStorage; partitionCount: number }) {
    this.dataStorage = dataStorage;
    this.partitionCount = partitionCount;
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
