import { Consumer } from "../consumer";
import { Producer } from "../producer";
import { Broker } from "../broker";

describe("Stage 1", () => {
  it("should be test consumer and producer", () => {
    const broker = new Broker();

    const producer = new Producer({ broker });
    const consumer = new Consumer({ broker });

    producer.send({ topic: "test", messages: ["hello world"] });

    const mockCallback = jest.fn();
    consumer.subscribe({
      topic: "test",
      callback: (message) => {
        mockCallback(message);
      },
    });

    expect(mockCallback).toBeCalledWith("hello world");
  });
});
