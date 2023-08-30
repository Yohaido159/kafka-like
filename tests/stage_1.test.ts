import { Broker } from "../broker";
import { Consumer } from "../consumer";
import { Coordinator } from "../coordinator";
import { InMemoryDataStorage } from "../dataStorage";
import { Producer } from "../producer";
import { StateStorage } from "../stateStorage";
import { AtLeastOnce, AtMostOnce } from "../strategies";

describe("Stage 1", () => {
  it("should be test consumer and producer with simplest way", async () => {
    const broker = new Broker({
      partitionsCount: 2,
      dataStorage: new InMemoryDataStorage(),
    });

    const coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: "test", broker });

    const producer = new Producer({ coordinator });
    const consumer = new Consumer({
      coordinator,
      id: "consumer-1",
      strategy: new AtMostOnce(),
      stateStorage: new StateStorage(),
    });

    producer.send({ topic: "test", message: "hello world", partition: 0 });
    producer.send({
      topic: "some-other-topic",
      message: "hello world",
      partition: 1,
    });

    const messages = await consumer.pullMessages({
      topic: "test",
      partition: 0,
    });
    expect(messages).toEqual([
      {
        topic: "test",
        message: "hello world",
        partition: 0,
        offset: 0,
      },
    ]);
    expect(await consumer.pullMessages({ topic: "test", partition: 0 })).toEqual([]);
  });

  it("should be test 'at least once' strategy", async () => {
    const broker = new Broker({
      partitionsCount: 2,
      dataStorage: new InMemoryDataStorage(),
    });

    const coordinator = new Coordinator();
    coordinator.attachBrokerToTopic({ topic: "test", broker });

    const atLeastOnce = new AtLeastOnce();

    const producer = new Producer({ coordinator });
    const consumer = new Consumer({
      coordinator,
      id: "consumer-1",
      strategy: atLeastOnce,
      stateStorage: new StateStorage(),
    });

    producer.send({ topic: "test", message: "hello world", partition: 0 });
    producer.send({
      topic: "some-other-topic",
      message: "hello world",
      partition: 1,
    });

    const messages = await consumer.pullMessages({
      topic: "test",
      partition: 0,
    });
    expect(messages).toEqual([
      {
        topic: "test",
        message: "hello world",
        partition: 0,
        offset: 0,
      },
    ]);
    const messages2 = await consumer.pullMessages({
      topic: "test",
      partition: 0,
    });
    expect(messages2).toEqual([]);
  });
});
