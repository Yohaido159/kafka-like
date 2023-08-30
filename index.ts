import { Broker } from "./broker";
import { Consumer } from "./consumer";
import { Coordinator } from "./coordinator";
import { InMemoryDataStorage } from "./dataStorage";
import { Producer } from "./producer";
import { StateStorage } from "./stateStorage";
import { AtLeastOnce } from "./strategies";

const Main = async () => {
  const dataStorage = new InMemoryDataStorage();

  const broker = new Broker({
    partitionsCount: 2,
    dataStorage,
  });

  const coordinator = new Coordinator();
  coordinator.attachBrokerToTopic({ topic: "test", broker });

  const producer = new Producer({ coordinator });
  const consumer = new Consumer({ coordinator, id: "consumer-1", strategy: new AtLeastOnce(), stateStorage: new StateStorage() });

  setInterval(() => {
    producer.send({ topic: "test", message: `${Math.random()} message from producer`, partition: 0 });
  }, 1000);

  setInterval(async () => {
    const messages = await consumer.pullMessages({ topic: "test", partition: 0 });
    console.log("🚀 ~ file: index.ts:40 ~ setInterval ~ messages:\n");
    console.log("🚀 ~ file: index.ts:40 ~ setInterval ~ messages:", messages);
    console.log("🚀 ~ file: index.ts:40 ~ setInterval ~ messages:\n");
  }, 2000);
};

Main();
