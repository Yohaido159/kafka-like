import { IBroker, ICoordinator } from './allTypes';

export class Coordinator implements ICoordinator {
  private borkers: { [key: string]: IBroker[] };

  constructor() {
    this.borkers = {};
  }

  attachBrokerToTopic({ topic, broker }: { topic: string; broker: IBroker }) {
    if (!this.borkers[topic]) {
      this.borkers[topic] = [];
    }

    this.borkers[topic] = [...this.borkers[topic], broker];
  }

  getBrokerForTopic({ topic }: { topic: string }) {
    const hash = this.getHashFormString({ string: topic });
    const brokers = this.borkers[topic];
    const index = hash % brokers.length;
    return brokers[index];
  }

  getHashFormString({ string }: { string: string }) {
    const hash = string.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return hash;
  }
}
