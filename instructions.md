# Pseudo-Code Overview

## Coordinator
* Maintain a list of brokers.
* Maintain a mapping of topics to brokers and partitions.
* Provide metadata to producers and consumers.

## Producer
* Consult the Coordinator for metadata.
* Send a message to the appropriate broker and partition.

## Consumer
* Consult the Coordinator for metadata.
* Subscribe to a specific broker and partition.
* Maintain an offset for each topic.

## Broker
* Maintain a list of partitions.
* Route messages to the appropriate partition based on a hash function.

## DeliveryStrategy Interface
* send: Handles the sending logic based on the strategy.
* acknowledge: Handles the acknowledgment logic.
