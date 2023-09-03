import { Broker } from '@/broker';
import { Consumer } from '@/consumer';
import { Coordinator } from '@/coordinator';
import { InMemoryDataStorage } from '@/dataStorage';
import { Producer } from '@/producer';
import { StateStorage } from '@/stateStorage';
import { AtLeastOnce, AtMostOnce } from '@/strategies';
import { IBroker, IConsumer, ICoordinator, IProducer } from '@allTypes';

describe('Kafka Strategies', () => {
  let producer: IProducer,
    consumer: IConsumer,
    coordinator: ICoordinator,
    broker: IBroker,
    stateStorage: StateStorage,
    dataStorage: InMemoryDataStorage;

  beforeEach(() => {
    dataStorage = new InMemoryDataStorage();

    broker = new Broker({
      dataStorage,
    });

    coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: 'test', broker });
    stateStorage = new StateStorage();
  });

  describe('At-Most-Once Strategy', () => {
    let strategy: AtMostOnce;

    beforeEach(() => {
      strategy = new AtMostOnce({
        stateStorage,
      });
      producer = new Producer({ coordinator, strategy });
      consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });
    });

    test('Producer should send a message without waiting for acknowledgment', () => {
      producer.send({ topic: 'test', message: 'message1' });

      expect(dataStorage.get({ topic: 'test' })).toContainEqual({
        message: 'message1',
        offset: 0,
        topic: 'test',
      });
    });

    test('Consumer should not pull the same message more than once', async () => {
      producer.send({ topic: 'test', message: 'message1' });
      const messages = await consumer.pullMessages({ topic: 'test' });
      expect(messages.length).toBe(1);
      expect(messages[0].offset).toBe(0);

      const newMessages = await consumer.pullMessages({ topic: 'test' });
      expect(newMessages.length).toBe(0);
    });
  });

  describe('At-Least-Once Strategy', () => {
    let strategy: AtLeastOnce;

    beforeEach(() => {
      strategy = new AtLeastOnce({
        stateStorage,
      });

      producer = new Producer({ coordinator, strategy });

      broker = new Broker({
        dataStorage,
      });

      coordinator = new Coordinator();
      coordinator.attachBrokerToTopic({ topic: 'test', broker });

      consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });
    });

    test('Producer should retry until it receives an acknowledgment', async () => {
      jest.spyOn(broker, 'addMessage').mockImplementationOnce(() => {
        throw new Error('Failed to add message');
      });

      producer = new Producer({ coordinator, strategy });

      await producer.send({ topic: 'test', message: 'message1' });
      await producer.send({ topic: 'test', message: 'message1' });

      consumer = new Consumer({
        coordinator,
        strategy,
        id: 'consumer1',
      });

      expect(await consumer.pullMessages({ topic: 'test' })).toEqual([
        { message: 'message1', offset: 0, topic: 'test' },
        { message: 'message1', offset: 1, topic: 'test' },
      ]);
    });

    test('Consumer should send an acknowledgment after processing', async () => {
      jest.spyOn(broker, 'pollForMessages').mockImplementationOnce(() => {
        throw new Error('Failed to poll for messages');
      });

      jest.spyOn(broker, 'addMessage').mockImplementationOnce(() => {
        throw new Error('Failed to add message');
      });

      await producer.send({ topic: 'test', message: 'message1' });
      const messages = await consumer.pullMessages({ topic: 'test' });

      expect(messages.length).toBe(1);
    });
  });
});
