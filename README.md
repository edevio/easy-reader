# Easy Reader

A minimal Chrome extension for distraction-free reading. Click the icon to strip a page down to its content.

## Features

- Click the extension icon to enter reading mode. Click again to exit.
- Dark mode by default, with a light mode toggle inside the reading view.
- Side navigation shows the article headings. Click any to jump to that section.
- Theme preference is saved across all sites.

## Design

- Column width: 660 px
- Font: New York, ui-serif, Georgia
- Font size: 18 px, line height: 1.6
- Dark background: `#1A1918` / Dark text: `#E8E6E1`
- Light background: `#F5F4F0` / Light text: `#2C2C2A`

## Theory

See theory.md for the foundation behind these decisions.

## Installation

Chrome extensions loaded from a local folder require Developer mode. This is a built-in Chrome setting for running unpacked extensions and does not affect normal browsing.

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Toggle **Developer mode** on in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder containing this project (the one with `manifest.json`).
6. Easy Reader will appear in your extensions list. Pin it via the puzzle piece icon in the toolbar.

To update after changing any files, go to `chrome://extensions` and click the reload icon on the Easy Reader card.

## Credits

Content extraction uses [Mozilla Readability](https://github.com/mozilla/readability), the library behind Firefox Reader View. Licensed under the Apache License 2.0.

## License

Free to use by anyone, for any purpose.
