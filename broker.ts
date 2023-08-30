export class Broker {
  private topics: { [key: string]: string[] } = {};
  private messages: { [key: string]: string[] } = {};

  constructor() {
    this.topics = {};
    this.messages = {};
  }

  addMessage({ topic, message }) {
    if (!this.messages[topic]) {
      this.messages[topic] = [];
    }

    this.messages[topic].push(message);
  }

  addConsumer({ topic, consumer }) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(consumer);
  }

  pollForMessages({ topic }) {
    return this.topics[topic];
  }
}
