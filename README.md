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

```json
{
  "op": 6,
  "cmd": "CONNECT_GUILD",
  "d": {
    "token": "q937ue0hw09fyhe.0s98fhs98d0h", // an application hash token for this guild
    "gid": "123467"
  }
}
```

```json
{
  "op": 6,
  "cmd": "DESCONNECT_GUILD",
  "d": {
    "gid": "123467"
  }
}
```

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

# Events

Discord event name | Event name | Info

GUILDS_MEMBER_ADD or GUILDS_MEMBER_REMOVE -> GUILD_MEMBER_COUNT_CHANGE => Emited when a member joins/leaves

GUILD_MEMBER_UPDATE ->

- - GUILD_PRIVILEGE_UPDATE => Emited when the current users permissions change in that server

# TODO

- [x] Authentication process
- [x] Setup a stable discord gateway connection.
- [ ] Start sending/resiving a heartbeat

©copyright 2021 dmod
