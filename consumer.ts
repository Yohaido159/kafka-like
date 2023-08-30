import { Strategy, ICoordinator, IStateStorage } from './allTypes';

export class Consumer {
  private coordinator: ICoordinator;
  private strategy: Strategy;
  private stateStorage: IStateStorage;
  private id: string;

  constructor({
    coordinator,
    id,
    strategy,
    stateStorage,
  }: {
    coordinator: ICoordinator;
    id: string;
    strategy: Strategy;
    stateStorage: IStateStorage;
  }) {
    this.id = id;
    this.coordinator = coordinator;
    this.strategy = strategy;
    this.stateStorage = stateStorage;
  }

  async pullMessages({ topic, partition, offset }: { topic: string; partition: number; offset?: number }) {
    const currentOffset = offset || this.stateStorage.getCurrentOffset();
    const broker = this.coordinator.getBrokerForTopic({ topic });
    const messages = this.strategy.call({
      broker,
      topic,
      partition,
      offset: currentOffset,
    });
    this.stateStorage.setCurrentOffset(messages[messages.length - 1]?.offset ?? currentOffset);
    messages.map((message) => this.strategy.ack({ broker, topic, partition, offset: message.offset }));
    return messages;
  }
}
