import { Broker } from "./broker";
import { Consumer } from "./consumer";
import { Producer } from "./producer";

const broker = new Broker();

const producer = new Producer({ broker });
const consumer = new Consumer({ broker });

producer.send({ topic: "test", message: "hello world" });

consumer.subscribe({
  topic: "test",
  callback: (message) => {
    console.log(message);
  },
});
