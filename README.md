# Operation codes

> "=>" Means a payload going from the server to the client.
> "<=" Means a payload going from teh client to the server

0 => request authentication

```json
{ "op": 0, "t": null, "d": null }
```

1 <= authenticate

```json
{
  "op": 1,
  "d": {
    "token": "a0uisd9uasrj39uwr0p9j4t-w0fepsduj9fus9df", // Pregenerated user hash token - or null for basic data/current global hash token for basic data
    "uid": null // logedin user id - if any
  }
}
```

2 => authentication passed

```json
{
  "op": 2,
  "t": null,
  "d": {
    "missed_notifications": [
      {
        "type": "APPLICATION_REVIWED",
        "proccessed_type": 0
      }
    ]
  }
}
```

3 => heartbeat

```json
{ "op": 3, "t": null, "d": null }
```

4 <= send back heartbeat responce

```json
{ "op": 4, "t": null, "d": null }
```

5 => event payload

```json
{
  "op": 5,
  "ev": "GUILD_PRIVILEGE_UPDATE",
  "d": {
    "id": "1234",
    "tag": "name#disc",
    "self": true, // if this is a permissions update of this user // NOTE: will most likely remove
    "permissions": "0" // new permissions
  }
}
```

6 => send cmd

- CONNECT_GUILD -> starts resiving data form that guild

- DESCONNECT_GUILD -> Stop getting data form that guild
  > Note: Only one guild connection allowed if any other is attempted it will remove the previous

7 => cmd responce

```json
{
  "op": 7,
  "d": {
    "for": "CONNECT_GUILD",
    "data": {
      "guild": {
        "count": 100,
        "banner": null,
        "icon": "abcdef",
        "premium_tier": 1,
        "verification_level": 3,
        "emojis": [],
        "current_invite_valid": false, // if the current invite shown is valid
        "vanity": null
      },
      "user": {
        "id": "1234",
        "tag": "name#disc",
        "permissions": "0"
      }
    }
  }
}
```

```json
{
  "op": 7,
  "d": {
    "for": "DESCONNECT_GUILD",
    "data": {
      "success": true
    }
  }
}
```

# Commands

"CONNECT_GUILD" -> Connect to a guild application

```json
{
  "op": 6,
  "cmd": "CONNECT_GUILD",
  "d": {
    "token": "q937ue0hw09fyhe.0s98fhs98d0h", // an guild application hash
    "gid": "123467"
  }
}
```

"DESCONNECT_GUILD" -> Disconnect from a guild application

```json
{
  "op": 6,
  "cmd": "DESCONNECT_GUILD",
  "d": {
    "gid": "123467"
  }
}
```

"APPLICATION_SESSION" -> Start a live application session

```json
{
  "op": 7,
  "cmd": "APPLICATION_SESSION",
  "d": {
    "uid": "000", // user id
    "gid": "0001", // guild id
    "utokh": "", // user token hash
    "uhash": "" // user gateway hash
  }
}
```

"APPLICATION_SESSION_END" -> End the application session

```json
{
  "op": 7,
  "cmd": "APPLICATION_SESSION_END",
  "d": {
    "gid": "0001"
  }
}
```

"APPLICATION_SESSION_REAUTH" -> When the application session requests you to reauth command name, packet ->

```json
{
  "op": 7,
  "cmd": "APPLICATION_SESSION_REAUTH",
  "d": {
    "utokh": "", // user token hash
    "uhash": "", // user gateway hash
    "pm": "64" // past permissions of this member
  }
}
```

"APPLICATION_SESSION_HB_M" => Send back heartbeat

# Events

None discord;

Event name | Info

APPLICATION_SESSION_HB_P => Session heartbeat

APPLICATION_SESSION_END => When a application session is ended

Discord event name | Event name | Info

GUILDS_MEMBER_ADD or GUILDS_MEMBER_REMOVE -> GUILD_MEMBER_COUNT_CHANGE => Emited when a member joins/leaves

GUILD_MEMBER_UPDATE ->

- - GUILD_PRIVILEGE_UPDATE => Emited when the current users permissions change in that server

# TODO

- [x] Authentication process
- [x] Setup a stable discord gateway connection.
- [ ] Patch application from from session live by command
- [ ] Start sending/resiving a heartbeat

©copyright 2021 dmod
