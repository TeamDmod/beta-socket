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

GUILDS_MEMBER_ADD => Emited when a member joins

GUILDS_MEMBER_REMOVE => Emited when a member leaves

GUILD_MEMBER_UPDATE ->

- - GUILD_PRIVILEGE_UPDATE => Emited when the current users permissions change in that server

# Other

## Token module

```json
{
  "type": "user" | "guild",
  "token": "415ojasd._05345a8f98agf89a4oh3", // Original token base
  "hash": "3AD3078884F5F8A7885CD5FEB99B8E1CF4C0C74258DB1B3F34F8B541DD55C6D9F8E2FA76F45D1A245C1287635DB8EB6245FDF1B9920ED80F0D41588BA4C25412", // SHA512 Hash
  "expire": DATE
}
```

# TODO

- [ ] Authentication process
- [ ] Setup a stable discord gateway connection.

©copyright 2021 dmod
