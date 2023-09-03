import { AtLeastOnce, AtMostOnce } from '@/strategies';
import { IBroker, IConsumer, ICoordinator, IProducer, IStrategy } from '@allTypes';

import { Broker } from '../src/broker';
import { Consumer } from '../src/consumer';
import { Coordinator } from '../src/coordinator';
import { InMemoryDataStorage } from '../src/dataStorage';
import { Producer } from '../src/producer';
import { StateStorage } from '../src/stateStorage';

describe('Kafka-like System', () => {
  let producer: IProducer,
    consumer: IConsumer,
    coordinator: ICoordinator,
    broker: IBroker,
    stateStorage: StateStorage,
    strategy: IStrategy;

  beforeEach(() => {
    broker = new Broker({
      dataStorage: new InMemoryDataStorage(),
    });

    coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: 'test', broker });

    strategy = new AtMostOnce({
      stateStorage,
    });

    producer = new Producer({ coordinator, strategy });
    stateStorage = new StateStorage();

    consumer = new Consumer({
      coordinator,
      strategy,
      id: 'consumer1',
    });
  });

  describe('Regular Flows', () => {
    test('Producer sends message', async () => {
      const message = 'hello world';
      const topic = 'test';

      await producer.send({ topic, message });

      expect(await broker.pollForMessages({ topic, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',

          offset: 0,
        },
      ]);
    });

    test('Consumer receives message', async () => {
      const message = 'hello world';
      const topic = 'test';

      producer.send({ topic, message });

      const messages = await await consumer.pullMessages({ topic });

      expect(messages).toEqual([
        {
          topic: 'test',
          message: 'hello world',

          offset: 0,
        },
      ]);
    });

    test('Coordinator assigns topics to brokers', async () => {
      const message = 'hello world';
      const topic = 'test';
      const broker2 = new Broker({
        dataStorage: new InMemoryDataStorage(),
      });

      coordinator.attachBrokerToTopic({ topic: 'test', broker: broker2 });

      await producer.send({ topic, message });

      expect(coordinator.getBrokerForTopic({ topic: 'test' })).toEqual(broker);
    });
  });

  describe('Edge Cases', () => {
    test('No consumers for a topic', async () => {
      const message = 'hello world';
      const topic = 'test';

      await producer.send({ topic, message });

      expect(await broker.pollForMessages({ topic, offset: 0 })).toEqual([
        {
          topic: 'test',
          message: 'hello world',

          offset: 0,
        },
      ]);
    });

    test('Multiple consumers for a topic', async () => {
      const message = 'hello world';
      const topic = 'test';

      const consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });

      const consumer2 = new Consumer({
        coordinator,
        strategy,
        id: 'consumer2',
      });

      await producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          offset: 0,
        },
      ]);

      expect(await consumer2.pullMessages({ topic })).toEqual([
        {
          topic: 'test',
          message: 'hello world',

          offset: 0,
        },
      ]);
    });

    test('Consumer acknowledgment', async () => {
      const message = 'hello world';
      const topic = 'test';

      const consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });

      await producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic })).toEqual([
        {
          topic: 'test',
          message: 'hello world',

          offset: 0,
        },
      ]);

      // consumer.ack({ topic, offset: 0 });

      expect(await consumer.pullMessages({ topic })).toEqual([]);
    });

    test('Consumer offset management', async () => {
      const message = 'hello world';
      const topic = 'test';

      const consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });

      await producer.send({ topic, message });

      expect(await consumer.pullMessages({ topic })).toEqual([
        {
          topic: 'test',
          message: 'hello world',
          offset: 0,
        },
      ]);

      producer.send({ topic, message: 'hello world 2' });

      // consumer.ack({ topic, offset: 0 });

      expect(await consumer.pullMessages({ topic })).toEqual([
        {
          topic: 'test',
          message: 'hello world 2',
          offset: 1,
        },
      ]);
    });

    test('Broker failure', () => {
      // Setup
      // Execution
      // Assertions
    });
  });
});
