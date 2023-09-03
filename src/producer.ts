import { ICoordinator, IProducer, IStrategy } from './allTypes';
import { Coordinator } from './coordinator';

export class Producer implements IProducer {
  private coordinator: ICoordinator;
  private strategy: IStrategy;

  constructor({ coordinator, strategy }: { coordinator: ICoordinator; strategy: IStrategy }) {
    this.coordinator = coordinator;
    this.strategy = strategy;
  }

  async send({ topic, message }: { topic: string; message: string }) {
    const broker = this.coordinator.getBrokerForTopic({ topic });
    await this.strategy.sendMessage({ topic, message, broker });
  }
}
