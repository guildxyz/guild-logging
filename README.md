# Guild Logging

Logging util for Guild.xyz's backend infrastructure.

## Installation

```
npm install @guildxyz/logging
```

## Example usage

```typescript
import GuildLogger from "@guildxyz/logging";

const guildLogger = new GuildLogger({
  correlator: myCorrelator, // correlation id provider
  json: true, // format logs as json
  level: "debug", // log level
  silent: false, // hide all logs
  pretty: true, // prettify json logs / colorize text logs
});

guildLogger.info("user joined guild", {
  params: { connect: false },
  user: { address: "0x123" },
  guild: { id: 1985 },
  role: [{ id: 1904 }, { id: 1905 }],
  error: platformError, // the key has to be 'error' to log it properly
});
```

### output

```
{
  params: { connect: false },
  user: { address: '0x123' },
  guild: { id: 1985 },
  role: [ { id: 1904 }, { id: 1905 } ],
  myMetadata: { myKey: 'myValue' },
  correlationId: '4fb94571-7f97-4fe0-a1b8-eb82994fb754',
  function: 'Object.<anonymous>',
  file: '/home/user/guild-logging/example.ts:12:13',
  pid: 42,
  level: 'info',
  message: 'user joined guild',
  timestamp: '2023-04-20 14:47:05',
  error: {name: 'PlatformError', message: 'add role failed', stack: ...}
}
```
