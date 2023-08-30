import { Strategy } from 'allTypes';

import { Broker } from '../broker';
import { Consumer } from '../consumer';
import { Coordinator } from '../coordinator';
import { InMemoryDataStorage } from '../dataStorage';
import { Producer } from '../producer';
import { StateStorage } from '../stateStorage';
import { AtLeastOnce, AtMostOnce } from '../strategies';

describe.only('Stage 1', () => {
  // Helper functions
  const setup = () => {
    const broker = new Broker({
      partitionsCount: 2,
      dataStorage: new InMemoryDataStorage(),
    });

    const coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: 'test', broker });

    return { broker, coordinator };
  };

  it('should be test consumer and producer with simplest way', async () => {
    const { coordinator } = setup();
    const producer = new Producer({ coordinator });
    const consumer = new Consumer({
      coordinator,
      id: 'consumer-1',
      strategy: new AtMostOnce(),
      stateStorage: new StateStorage(),
    });

    producer.send({ topic: 'test', message: 'hello world', partition: 0 });
    producer.send({
      topic: 'some-other-topic',
      message: 'hello world',
      partition: 1,
    });

    const messages = await consumer.pullMessages({
      topic: 'test',
      partition: 0,
    });
    expect(messages).toEqual([
      {
        topic: 'test',
        message: 'hello world',
        partition: 0,
        offset: 0,
      },
    ]);
    expect(await consumer.pullMessages({ topic: 'test', partition: 0 })).toEqual([]);
  });

  it("should be test 'at least once' strategy", async () => {
    const { coordinator } = setup();
    const producer = new Producer({ coordinator });

    const consumer = new Consumer({
      coordinator,
      id: 'consumer-1',
      strategy: new AtMostOnce(),
      stateStorage: new StateStorage(),
    });

    const consumer2 = new Consumer({
      coordinator,
      id: 'consumer-2',
      strategy: new AtLeastOnce(),
      stateStorage: new StateStorage(),
    });

    producer.send({ topic: 'test', message: 'hello world', partition: 0 });
    producer.send({
      topic: 'some-other-topic',
      message: 'hello world',
      partition: 1,
    });

    const messages = await consumer.pullMessages({
      topic: 'test',
      partition: 0,
    });

    const messages2 = await consumer2.pullMessages({
      topic: 'test',
      partition: 0,
    });

    const resultMessages = [
      {
        topic: 'test',
        message: 'hello world',
        partition: 0,
        offset: 0,
      },
    ];

    expect(messages).toEqual(resultMessages);
    expect(await consumer.pullMessages({ topic: 'test', partition: 0 })).toEqual([]);

    expect(messages2).toEqual(resultMessages);
    expect(await consumer2.pullMessages({ topic: 'test', partition: 0 })).toEqual([]);
  });

  it('should be test consumer and producer 4 times', async () => {
    const { coordinator } = setup();
    const producer = new Producer({ coordinator });
    const consumer = new Consumer({
      coordinator,
      id: 'consumer-1',
      strategy: new AtMostOnce(),
      stateStorage: new StateStorage(),
    });

    producer.send({ topic: 'test', message: 'hello world', partition: 0 });
    producer.send({ topic: 'test', message: 'hello world', partition: 0 });

    const messages = await consumer.pullMessages({
      topic: 'test',
      partition: 0,
    });
    expect(consumer.stateStorage.getCurrentOffset()).toEqual(2);
    expect(messages[messages.length - 1].offset).toEqual(1);
    expect(messages.length).toEqual(2);

    producer.send({ topic: 'test', message: 'hello world', partition: 0 });
    producer.send({ topic: 'test', message: 'hello world', partition: 0 });
    producer.send({ topic: 'test', message: 'hello world', partition: 0 });

    const messages2 = await consumer.pullMessages({
      topic: 'test',
      partition: 0,
    });
    expect(consumer.stateStorage.getCurrentOffset()).toEqual(5);
    expect(messages2[messages2.length - 1].offset).toEqual(4);
    expect(messages2.length).toEqual(3);
  });
});
