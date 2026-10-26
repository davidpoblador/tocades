# Tocades

A word clock that tells the time in Catalan using the traditional bell-tower
system (*sistema de campanar tradicional*), where hours are divided into
quarters and each quarter belongs to the next hour.

Live at **[tocades.poblador.cat](https://tocades.poblador.cat/)**.

## The language

Unlike most clocks that just read off digits, the *sistema de campanar*
thinks about time as a continuous journey between quarter-hour references:

```
15:00  →  Són les tres
15:03  →  Són les tres tocades
15:05  →  Són les tres ben tocades
15:07  →  És mig quart de quatre
15:10  →  És mig quart passat de quatre
15:14  →  És vora un quart de quatre
15:15  →  És un quart de quatre
15:22  →  És un quart i mig de quatre
15:30  →  Són dos quarts de quatre
15:37  →  Són dos quarts i mig de quatre
15:45  →  Són tres quarts de quatre
15:52  →  Són tres quarts i mig de quatre
15:59  →  Són vora les quatre
16:00  →  Són les quatre
```

Every minute of the day gets its own phrase, built from seven modifiers
applied to the current quarter reference:

| Offset  | Form                          |
|---------|-------------------------------|
| +0, +1  | *[ref]*                       |
| +2, +3  | *[ref] tocada(es)/tocat(s)*   |
| +4, +5  | *[ref] ben tocada(es)/tocat(s)* |
| +6      | *vora [mig ref]*              |
| +7, +8  | *[mig ref]*                   |
| +9..+11 | *[mig ref] passat(s)*         |
| +12,+13 | *[mig ref] ben passat(s)*     |
| +14     | *vora [next ref]*             |

Verb (*és*/*són*) and modifier gender/number always agree with the reference.

## The grid

A 15×15 letter matrix that fits every phrase from 00:00 to 23:59. Unlit
letters remain faintly visible; filler letters are random but never match
their orthogonal neighbors. The compound words `D'UNA` and `D'ONZE` are
single contiguous blocks so the elision reads naturally.

## Running locally

Static site, no build step:

```bash
python3 -m http.server 8765
# open http://localhost:8765/
```

## Credit

By [David Poblador i Garcia](https://poblador.cat/). Built with Claude.

Language reference: [Sistema tradicional o de campanar (Diputació de Barcelona)](https://llengua.diba.cat/sistema-tradicional-o-de-campanar).
