import { Broker } from "./broker";
import { Coordinator } from "./coordinator";
import { StateStorage } from "./stateStorage";
import type { Strategy } from "./strategies";

export class Consumer {
  private coordinator: Coordinator;
  private strategy: Strategy;
  private stateStorage: StateStorage;
  private id: string;

  constructor({
    coordinator,
    id,
    strategy,
    stateStorage,
  }: {
    coordinator: Coordinator;
    id: string;
    strategy: Strategy;
    stateStorage: StateStorage;
  }) {
    this.id = id;
    this.coordinator = coordinator;
    this.strategy = strategy;
    this.stateStorage = stateStorage;
  }

  async pullMessages({ topic, partition, offset }: { topic: string; partition: number; offset?: number }) {
    const currentOffset = offset || this.stateStorage.getCurrentOffset();
    console.log("🚀 ~ file: consumer.ts:31 ~ Consumer ~ pullMessages ~ currentOffset:", currentOffset);
    const broker = this.coordinator.getBrokerForTopic({ topic });
    const messages = this.strategy.call({ broker, topic, partition, offset: currentOffset });
    this.stateStorage.setCurrentOffset(messages[messages.length - 1]?.offset ?? currentOffset);
    messages.map((message) => this.strategy.ack({ broker, topic, partition, offset: message.offset }));
    return messages;
  }
}
