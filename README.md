# pgmq-js - Postgres Message Queue (PSMQ) JavaScript Client Library

## Supported Functionalities

- [x] Sending Messages
  - [x] send
  - [x] send_batch
- [ ] Reading Messages
  - [x] read
  - [ ] read_with_poll
  - [x] pop
- [x] Deleting/Archiving Messages
  - [x] delete (single)
  - [x] delete (batch)
  - [x] purge_queue
  - [x] archive (single)
  - [x] archive (batch)
- [ ] Queue Management
  - [x] create
  - [ ] create_partitioned
  - [x] create_unlogged
  - [x] detach_archive
  - [x] drop_queue
- [ ] Utilities
  - [ ] set_vt
  - [x] list_queues
  - [ ] metrics
  - [ ] metrics_all
