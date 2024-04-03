# Markwright

![Markwright](icon.png)

A VSCode plugin for quick-and-dirty typesetting using Markdown, CSS and [PagedJS](https://pagedjs.org/).

## Installation

- <kbd>git clone https://github.com/noahlange/markwright-vscode.git</kbd>
- <kbd>cd markwright-vscode</kbd>
- <kbd>npm i && npm run dev:bundle</kbd>
- Command Palette
  - "Extensions: Install from VSIX..."
  - "Markwright: Open the working directory as a Markwright document."

## Roadmap

- actual distribution
- minimap navigation
- scroll + zoom + pan
- non-facing page layouts
- PDF export
- configuration

## Implementation details

### Content & Styles

- all markdown (`.md`, `.markdown`) files in the workspace are concatenated in alphabetical order.
- all CSS (`.css`) files in the workspace are concatenated in alphabetical order.

### Images

Image paths are resolved _relative to_ the Markdown or CSS file referencing the image.

```html
<!-- Given /Users/foo/source.md -->

<!-- the relative path -->
<img alt="My Image" src="./image.svg" />

<!--- resolves to... -->
<img alt="My Image" src="/Users/foo/image.svg" />
```

```scss
// /Users/foo/styles.css

div {
  // relative path...
  background: url('./image.svg');
  // resolves to...
  background: url('/Users/foo/image.svg');
}
```
