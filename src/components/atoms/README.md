# Atoms Layer

Atoms are the smallest, indivisible building blocks of PASSIO's UI. They are completely dumb, state-free, and style-driven.

## Examples
- `Button` (pure layout buttons)
- `Input` (raw textbox controls)
- `Badge` (subtle category tags)
- `Divider` (hairline grid line)
- `Text` (typographical wrapper)

## Design Constraints
- No business logic imports.
- Only receive styling tokens via props.
- Focus-styles and touch-targets (min 44px) are mandatory.
