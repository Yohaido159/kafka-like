import { Broker } from "./broker";

export class Consumer {
  constructor({ broker }: { broker: Broker }) {}

  subscribe({ topic, callback }) {}
}
