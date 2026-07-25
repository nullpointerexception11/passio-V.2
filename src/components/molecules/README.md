# Molecules Layer

Molecules are simple composite components consisting of groups of Atoms. They handle layout relationships between atoms but remain mostly stateless and decoupled from specific application databases.

## Examples
- `FormField` (Label + Input + HelperText)
- `TabControl` (Group of action button pills)
- `SearchBox` (Input + SearchIcon)
- `ListItem` (Checkbox + Text title)

## Design Constraints
- Must not fetch data directly.
- May contain UI interaction state (e.g., hover states, open/close dropdown status).
