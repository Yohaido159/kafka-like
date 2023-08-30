import { Broker, Message } from "./broker";

export interface Strategy {
  call({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }): Message[];
  ack({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }): void;
}

export class AtMostOnce {
  call({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    messages.forEach((message) => broker.ack({ topic, partition, offset: message.offset }));
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    return;
  }
}

export class AtLeastOnce {
  call({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    broker.ack({ topic, partition, offset });
  }
}

export class ExactlyOnce {
  call({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: Broker; topic: string; partition: number; offset: number }) {
    broker.ack({ topic, partition, offset });
  }
}
