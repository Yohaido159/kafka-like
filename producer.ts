import { Broker } from "./broker";

export class Producer {
  private broker: Broker;

  constructor({ broker }: { broker: Broker }) {
    this.broker = broker;
  }

  send({ topic, message }) {
    this.broker.addMessage({ topic, message });
  }
}
