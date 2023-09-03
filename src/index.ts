import { StateStorage } from '../stateStorage';
import { AtLeastOnce } from '../strategies';

import { Broker } from './broker';
import { Consumer } from './consumer';
import { Coordinator } from './coordinator';
import { InDiskDataStorage, InMemoryDataStorage } from './dataStorage';
import { Producer } from './producer';

const Main = () => {
  const broker = new Broker({
    partitionsCount: 2,
    dataStorage: new InMemoryDataStorage(),
  });

  const coordinator = new Coordinator();
  coordinator.attachBrokerToTopic({ topic: 'test', broker });

  const producer = new Producer({ coordinator });
  const consumer = new Consumer({
    coordinator,
    id: 'consumer-1',
    strategy: new AtLeastOnce(),
    stateStorage: new StateStorage(),
  });

  setInterval(() => {
    producer.send({ topic: 'test', message: `${Math.random()} message from producer` });
  }, 1000);

  setInterval(() => {
    const messages = consumer.pullMessages({ topic: 'test' });
  }, 1000);
};

Main();
