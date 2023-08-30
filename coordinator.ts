import { IBroker } from './allTypes';

export class Coordinator {
  private borkers: { [key: string]: IBroker };

  constructor() {
    this.borkers = {};
  }

  attachBrokerToTopic({ topic, broker }: { topic: string; broker: IBroker }) {
    this.borkers[topic] = broker;
  }

  getBrokerForTopic({ topic }: { topic: string }) {
    const hash = this.getHashForTopic({ topic });
    const brokers = Object.values(this.borkers);
    const index = hash % brokers.length;
    return brokers[index];
  }

  getHashForTopic({ topic }: { topic: string }) {
    const hash = topic.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return hash;
  }
}
