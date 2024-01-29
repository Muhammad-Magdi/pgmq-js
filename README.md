# pgmq-js

Postgres Message Queue (PGMQ) JavaScript Client Library

<p>
  <a href="https://www.npmjs.com/package/pgmq-js">
    <img src="https://img.shields.io/npm/v/pgmq-js" alt="version"/>
  </a>
  <a href="https://www.npmjs.com/package/pgmq-js">
    <img src="https://img.shields.io/npm/dw/pgmq-js" alt="weekly downloads"/>
  </a>
  <a href="https://github.com/Muhammad-Magdi/pgmq-js/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/pgmq-js" alt="license"/>
  </a>
</p>

## Installation

As always:

```bash
npm i pgmq-js
```

## Usage

First, Start a Postgres instance with the PGMQ extension installed:

```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 quay.io/tembo/pgmq-pg:latest
```

Then:

```ts
import { Pgmq } from 'pgmq-js';

console.log('Connecting to Postgres...');
const pgmq = await Pgmq.new({
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
  user: 'postgres',
  ssl: false,
}).catch((err) => {
  console.error('Failed to connect to Postgres', err);
});

const qName = 'my_queue';
console.log(`Creating queue ${qName}...`);
await pgmq.queue.create(qName).catch((err) => {
  console.error('Failed to create queue', err);
});

interface Msg {
  id: number;
  name: string;
}
const msg: Msg = { id: 1, name: 'testMsg' };
console.log('Sending message...');
const msgId = await pgmq.msg.send(qName, msg).catch((err) => {
  console.error('Failed to send message', err);
});

const vt = 30;
const receivedMsg = await pgmq.msg.read<Msg>(qName, vt).catch((err) => {
  console.error('No messages in the queue', err);
});

console.log('Received message...');
console.dir(receivedMsg.message, { depth: null });

console.log('Archiving message...');
await pgmq.msg.archive(qName, msgId).catch((err) => {
  console.error('Failed to archive message', err);
});
```

## API

## Supported Functionalities

- [x] [Sending Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#sending-messages)
  - [x] [send](https://tembo-io.github.io/pgmq/api/sql/functions/#send)
  - [x] [send_batch](https://tembo-io.github.io/pgmq/api/sql/functions/#send_batch)
- [ ] [Reading Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#reading-messages)
  - [x] [read](https://tembo-io.github.io/pgmq/api/sql/functions/#read)
  - [ ] [read_with_poll](https://tembo-io.github.io/pgmq/api/sql/functions/#read_with_poll)
  - [x] [pop](https://tembo-io.github.io/pgmq/api/sql/functions/#pop)
- [x] [Deleting/Archiving Messages](https://tembo-io.github.io/pgmq/api/sql/functions/#deletingarchiving-messages)
  - [x] [delete (single)](https://tembo-io.github.io/pgmq/api/sql/functions/#delete-single)
  - [x] [delete (batch)](https://tembo-io.github.io/pgmq/api/sql/functions/#delete-batch)
  - [x] [purge_queue](https://tembo-io.github.io/pgmq/api/sql/functions/#purge_queue)
  - [x] [archive (single)](https://tembo-io.github.io/pgmq/api/sql/functions/#archive-single)
  - [x] [archive (batch)](https://tembo-io.github.io/pgmq/api/sql/functions/#archive-batch)
- [ ] [Queue Management](https://tembo-io.github.io/pgmq/api/sql/functions/#queue-management)
  - [x] [create](https://tembo-io.github.io/pgmq/api/sql/functions/#create)
  - [ ] [create_partitioned](https://tembo-io.github.io/pgmq/api/sql/functions/#create_partitioned)
  - [x] [create_unlogged](https://tembo-io.github.io/pgmq/api/sql/functions/#create_unlogged)
  - [x] [detach_archive](https://tembo-io.github.io/pgmq/api/sql/functions/#detach_archive)
  - [x] [drop_queue](https://tembo-io.github.io/pgmq/api/sql/functions/#drop_queue)
- [ ] [Utilities](https://tembo-io.github.io/pgmq/api/sql/functions/#utilities)
  - [ ] [set_vt](https://tembo-io.github.io/pgmq/api/sql/functions/#set_vt)
  - [x] [list_queues](https://tembo-io.github.io/pgmq/api/sql/functions/#list_queues)
  - [ ] [metrics](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics)
  - [ ] [metrics_all](https://tembo-io.github.io/pgmq/api/sql/functions/#metrics_all)
