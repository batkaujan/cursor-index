# Cursor Index
This is the package [cursor-index](https://atom.io/packages/cursor-index)
for the [Atom](https://atom.io/) text editor.  
Display the character index of the cursor (i.e. ***cursor index***) in the status bar.

The ***cursor index*** provided by this package is a 1D character index (not byte index), while  
the ***cursor position*** in the Atom core is a 2D point formed by a pair of row and column number.

### Installation
```
apm install cursor-index
```

### Usage
The cursor index of the text cursor for the active pane  
will be shown on the left of the status bar after installation.

Clicking on it pops up a dialog to enter the cursor index to be navigated,  
just like clicking on the cursor position.  
Pressing ALT-G is the corresponding short-cut. (Can be disabled in Settings)

### Settings
1. Can be toggled on/off (Default: `true` for on)
2. Zero/one-based index can be toggled (Default: `true` for zero-based)
3. Key-binding for ALT-G can be toggled on/off (Default: `true` for on)

### License
[ISC](./LICENSE)
