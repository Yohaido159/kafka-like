import { IBroker, Strategy } from './allTypes';

export class AtMostOnce implements Strategy {
  call({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    messages.forEach((message) => broker.ack({ topic, partition, offset: message.offset }));
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    return;
  }
}

export class AtLeastOnce implements Strategy {
  call({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    broker.ack({ topic, partition, offset });
  }
}

export class ExactlyOnce implements Strategy {
  call({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    const messages = broker.pollForMessages({ topic, partition, offset });
    return messages;
  }

  ack({ broker, topic, partition, offset }: { broker: IBroker; topic: string; partition: number; offset: number }) {
    broker.ack({ topic, partition, offset });
  }
}
