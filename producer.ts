import { Broker } from "./broker";
import { Coordinator } from "./coordinator";

export class Producer {
  private coordinator: Coordinator;

  constructor({ coordinator }: { coordinator: Coordinator }) {
    this.coordinator = coordinator;
  }

  send({ topic, message, partition }: { topic: string; message: string; partition: number }) {
    const broker = this.coordinator.getBrokerForTopic({ topic });
    broker.addMessage({ topic, message, partition });
  }
}
