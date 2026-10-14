# Stillword — Personal Prayer Journal

A responsive personal prayer journal built with plain HTML, CSS, and JavaScript. Entries are saved in the browser using `localStorage`.

## Files
- `index.html` — page structure
- `style.css` — layout, colors, responsive design, light theme
- `script.js` — journal entries, local saving, filters, theme toggle, backup/import

## Run it
1. Extract the ZIP.
2. Keep all three files in the same folder.
3. Open `index.html` in a modern browser. For the smoothest development experience, use VS Code with the Live Server extension.

## Saving and privacy
- Entries are saved in the current browser on the current device.
- Refreshing or reopening the same browser should keep your entries.
- Clearing browser site data, using a different browser/device, or some private-browsing sessions may remove or separate entries.
- The app does not send your entries to a server, but anyone with access to your unlocked browser profile may be able to open the journal.
- Use **Export my journal** regularly to download a JSON backup. Keep that file somewhere private. Use **Import backup** to restore/merge entries.
- This version has no password or cloud sync.

## Publish with GitHub Pages
Upload `index.html`, `style.css`, and `script.js` to the same folder in your repository. In repository Settings → Pages, select **Deploy from a branch**, choose `main` and `/(root)`, then Save. Wait for the deployment to finish.

Google Fonts are used when an internet connection is available; the site will fall back to system fonts offline.
