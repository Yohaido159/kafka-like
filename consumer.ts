import { Strategy, ICoordinator, IStateStorage, IConsumer } from './allTypes';

export class Consumer implements IConsumer {
  private coordinator: ICoordinator;
  private strategy: Strategy;
  public stateStorage: IStateStorage;
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
    const currentOffset = offset ?? this.stateStorage.getCurrentOffset();
    const broker = this.coordinator.getBrokerForTopic({ topic });
    const messages = this.strategy.call({
      messages: broker.pollForMessages({ topic, partition, offset: currentOffset }),
      consumer: this,
    });

    return messages;
  }

  setCurrentOffset(offset: number) {
    this.stateStorage.setCurrentOffset(offset);
  }
}
