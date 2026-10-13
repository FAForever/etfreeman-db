# UnitDatabaseData: TL;DR

A one-line comment in the weapon's projectile `*_script.lua` that exposes script-only
behavior to the unit database. The DB finds it via `weapon.ProjectileId`.
Pure comment: zero runtime effect.

```lua
-- UnitDatabaseData: {strict JSON, single line}
```

## Rules

- Exactly ONE line per file.
- Keys are weapon blueprint field names, merged into the weapon **over the blueprint
  values** (use to correct a lying blueprint), plus:
  - `"tooltip"` — freeform text shown on the weapon in the DB;
  - `"files": ["repo/relative/path_script.lua"]` — extra files whose top-level
    literal locals join the resolution scope (fetched on demand);
  - `*Ticks` variants (`DoTTimeTicks`) — value in game ticks (10/s), converted
    to the base key's unit (`DoTTime` seconds).
- `${Name}` resolves against top-level literal locals (number / string / boolean)
  of the same file and every `files` entry. No arithmetic. The constant stays the
  single source of truth.
- Any error — bad JSON, unknown key, unresolvable or duplicate name, a second
  annotation line — **fails the DB build loudly**.

## Examples

DoT keys, same-file constant (Emissary; `local HoldTicks = 38` above):

```lua
-- UnitDatabaseData: {"DoTPulses": 2, "DoTTimeTicks": "${HoldTicks}"}
```

DB: 6000 + 6000 DoT over 3.8 s, staying in sync with `HoldTicks`.

Cross-file values (Ahwassa bomb; constants live in effect entities):

```lua
-- UnitDatabaseData: {"files": ["effects/Entities/SBOOhwalliBombEffect01/SBOOhwalliBombEffect01_script.lua"], "tooltip": "Spawns ${PlumeCount} fireball plumes that deal ${PlumeDamage} damage each."}
```

Overriding weapon damage — the blueprint says a flat 12000, but the shell really
hits twice for 6000:

```lua
-- UnitDatabaseData: {"Damage": 6000, "DoTPulses": 2, "DoTTime": 3.8}
```

DB: two hits of 6000, 3.8 s apart, instead of one false 12000.
