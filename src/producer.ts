import { Broker } from './broker';
import { Coordinator } from './coordinator';

export class Producer {
  private coordinator: Coordinator;

  constructor({ coordinator }: { coordinator: Coordinator }) {
    this.coordinator = coordinator;
  }

  send({ topic, message }: { topic: string; message: string }) {
    const broker = this.coordinator.getBrokerForTopic({ topic });
    const partition = this.coordinator.getPartitionIndex({ message, topic, broker });
    broker.addMessage({ topic, message, partition });
  }
}
