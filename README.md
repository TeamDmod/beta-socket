# Operation codes

0 => request authentication

```json
{ "op": 0, "t": null, "d": null }
```

1 => authenticate

```json
{
  "op": 1,
  "d": {
    "token": "a0uisd9uasrj39uwr0p9j4t-w0fepsduj9fus9df", // application guild hash token
    "gid": "12345", // guild id
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
```

3 => heartbeat

```json
{ "op": 3, "t": null, "d": null }
```

4 => event payload

```json
{
  "op": 4,
  "ev": "PRIVILEGE_UPDATE",
  "d": {
    "id": "1234",
    "tag": "name#disc",
    "self": true, // if this is a permissions update of this user
    "permissions": "0" // new permissions
  }
}
```

# Events

Discord event name | Event name | Info

GUILDS_MEMBER_ADD -> MEMBER_ADD => Emited when a member joins

GUILDS_MEMBER_REMOVE -> MEMBER_REMOVE => Emited when a member leaves

GUILD_MEMBER_UPDATE ->

- - PRIVILEGE_UPDATE => Emited when the current users permissions change in that server

# TODO

- [ ] Authentication process
- [ ] Setup a stable discord gateway connection.

©copyright 2021 dmod
