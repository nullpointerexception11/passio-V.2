# Organisms Layer

Organisms are complex, high-level composites of Atoms and Molecules. They represent distinct, self-contained, functional regions of a view or page and may bind to application states or trigger state-dispatching hooks.

## Examples
- `DocumentListSidebar` (Searchbar + collection filters + list items)
- `FocusEditor` (Markdown editor panel + word counter + autosave actions)
- `ThemeSelector` (Visual cards representing light/dark design token states)

## Design Constraints
- Interacts with business logic (invokes repository hooks or state selectors).
- Dispatches domain commands or coordinates interactions between molecules.
