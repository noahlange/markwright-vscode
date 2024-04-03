# Markwright

![Markwright](icon.png)

A VSCode plugin for quick-and-dirty typesetting using Markdown, CSS and [PagedJS](https://pagedjs.org/).

## Content & Styles

- all markdown (`.md`, `.markdown`) files in the workspace are concatenated in alphabetical order.
- all CSS (`.css`) files in the workspace are concatenated in alphabetical order.

## Images

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
