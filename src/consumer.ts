import { ICoordinator, IStateStorage, IConsumer, IStrategy } from './allTypes';

export class Consumer implements IConsumer {
  private coordinator: ICoordinator;
  private strategy: IStrategy;
  private id: string;

  constructor({ coordinator, strategy, id }: { coordinator: ICoordinator; strategy: IStrategy; id: string }) {
    this.coordinator = coordinator;
    this.strategy = strategy;
    this.id = id;
  }

  async pullMessages({ topic }: { topic: string }) {
    const broker = this.coordinator.getBrokerForTopic({ topic });
    return await this.strategy.pullMessages({ broker, topic, consumerId: this.id });
  }
}
