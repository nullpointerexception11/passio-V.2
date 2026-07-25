# Layouts Layer

Layouts are structural templates that organize major sections of a page (such as sidebars, headers, content panes, or statusbars). They provide the grid and flexbox chassis where components sit.

## Examples
- `SplitPaneLayout` (Dual column layout for document review)
- `FocusStackLayout` (Centered focus layout with extreme negative margin space for distraction-free writing)

## Design Constraints
- Focus strictly on margins, flex grids, responsive padding, and z-index elevations.
- Accept children or named slot parameters to render layout occupants.
