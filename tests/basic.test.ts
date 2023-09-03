import { Broker } from '../src/broker';
import { Consumer } from '../src/consumer';
import { Coordinator } from '../src/coordinator';
import { InMemoryDataStorage } from '../src/dataStorage';
import { Producer } from '../src/producer';
import { StateStorage } from '../src/stateStorage';
import { AtLeastOnce, AtMostOnce } from '../src/strategies';

describe('Kafka-like System', () => {
  let producer: Producer, consumer: Consumer, coordinator: Coordinator, broker: Broker;

  beforeEach(() => {
    broker = new Broker({
      dataStorage: new InMemoryDataStorage(),
      partitionCount: 1,
    });

    coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: 'test', broker });

    producer = new Producer({ coordinator });
    consumer = new Consumer({
      coordinator,
      id: 'consumer-1',
      strategy: new AtMostOnce(),
      stateStorage: new StateStorage(),
    });
  });

  describe('Regular Flows', () => {
    test('Producer sends message', () => {
      const message = 'hello world';
      const topic = 'test';

      producer.send({ topic, message });

      expect(broker.pollForMessages({ topic, partition: 0, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);
    });

    test('Consumer receives message', async () => {
      const message = 'hello world';
      const topic = 'test';
      const partition = 0;

      producer.send({ topic, message });

      const messages = await consumer.pullMessages({ topic, partition });

      expect(messages).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);
    });

    test('Coordinator assigns topics to brokers', () => {
      const message = 'hello world';
      const topic = 'test';
      const broker2 = new Broker({
        dataStorage: new InMemoryDataStorage(),
        partitionCount: 2,
      });

      coordinator.attachBrokerToTopic({ topic: 'test', broker: broker2 });

      producer.send({ topic, message });

      expect(coordinator.getBrokerForTopic({ topic: 'test' })).toEqual(broker);
    });
  });

  describe('Edge Cases', () => {
    test('No consumers for a topic', () => {
      const message = 'hello world';
      const topic = 'test';
      const partition = 0;

      producer.send({ topic, message });

      expect(broker.pollForMessages({ topic, partition, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);
    });

    test('Multiple consumers for a topic', async () => {
      const message = 'hello world';
      const topic = 'test';
      const partition = 0;

      const consumer = new Consumer({
        coordinator,
        id: 'consumer-1',
        strategy: new AtLeastOnce(),
        stateStorage: new StateStorage(),
      });

      const consumer2 = new Consumer({
        coordinator,
        id: 'consumer-2',
        strategy: new AtLeastOnce(),
        stateStorage: new StateStorage(),
      });

      producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic, partition, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);

      expect(await consumer2.pullMessages({ topic, partition, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);
    });

    test('Consumer acknowledgment', async () => {
      const message = 'hello world';
      const topic = 'test';
      const partition = 0;

      const consumer = new Consumer({
        coordinator,
        id: 'consumer-1',
        strategy: new AtLeastOnce(),
        stateStorage: new StateStorage(),
      });

      producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic, partition })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);

      consumer.ack({ topic, partition, offset: 0 });

      expect(await consumer.pullMessages({ topic, partition })).toEqual([]);
    });

    test('Consumer offset management', async () => {
      const message = 'hello world';
      const topic = 'test';
      const partition = 0;

      const consumer = new Consumer({
        coordinator,
        id: 'consumer-1',
        strategy: new AtLeastOnce(),
        stateStorage: new StateStorage(),
      });

      producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic, partition })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          partition: 0,
          offset: 0,
        },
      ]);

      producer.send({ topic, message: 'hello world 2' });

      consumer.ack({ topic, partition, offset: 0 });

      expect(await consumer.pullMessages({ topic, partition })).toEqual([
        {
          topic: 'test',
          message: 'hello world 2',
          partition: 0,
          offset: 1,
        },
      ]);
    });

    test('Data skew (Partition imbalance)', () => {
      // Setup
      // Execution
      // Assertions
    });

    test('Broker failure', () => {
      // Setup
      // Execution
      // Assertions
    });
  });
});
