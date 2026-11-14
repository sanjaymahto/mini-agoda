# Mini Agoda - Documentation

| If you want to…                                         | Read                                         |
| ------------------------------------------------------- | -------------------------------------------- |
| **Understand how data moves, in plain English**          | [DATA_FLOW.md](./DATA_FLOW.md) ⭐ start here  |
| See requirements, high-level design, trade-offs, scaling | [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)       |
| Understand code layout & how Module Federation is wired | [ARCHITECTURE.md](./ARCHITECTURE.md)         |
| Know what each MFE owns, exposes, emits (team contracts) | [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md)   |
| Use URL / store / events correctly (code recipes)        | [COMMUNICATION.md](./COMMUNICATION.md)       |
| Look up entities, mock data & API functions              | [DATA_MODEL.md](./DATA_MODEL.md)             |
| Run, debug, or add a new MFE                             | [DEVELOPMENT.md](./DEVELOPMENT.md)           |
| Ship it to production                                    | [DEPLOYMENT.md](./DEPLOYMENT.md)             |

## Architecture Decision Records

| # | Decision |
| - | -------- |
| [0001](./adr/0001-module-federation.md) | Runtime composition with Module Federation |
| [0002](./adr/0002-vite.md) | Vite (with `@module-federation/vite`) as the build tool |
| [0003](./adr/0003-vertical-split.md) | Split MFEs vertically by user journey |
| [0004](./adr/0004-communication.md) | Communication via URL → store → events |
| [0005](./adr/0005-styling.md) | Scoped CSS Modules + global design tokens |
| [0006](./adr/0006-mock-api.md) | Mock API inside the shared package |

## Suggested reading order for new joiners

1. [DATA_FLOW.md](./DATA_FLOW.md) - 10 minutes, no code
2. [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - the "why"
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - the "how"
4. [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md) - your team's contract
5. [DEVELOPMENT.md](./DEVELOPMENT.md) - run it
