import ink from 'ink';
import * as path from 'path';
import * as fs from 'fs';
import React from 'react';
import { Chrome } from './apis/chrome.js';
import { Pin } from './components/Pin/Pin.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Store } from './store.js';
const { render } = ink;
const dir = dirname(fileURLToPath(import.meta.url));
const fpath = path.join(dir, '../../data/data.db');
/**
 * The core application
 *
 * @param args command-line arguments
 */
export const pin = async (args) => {
    const bookmarkPath = args['--bookmarks'];
    if (args.edit === true) {
        render(React.createElement(React.StrictMode, null,
            React.createElement(Pin, { bookmarkPath: bookmarkPath })), {});
    }
    else {
        const chrome = new Chrome(bookmarkPath);
        const store = new Store(fpath);
        const chromeContent = await chrome.asBookmarkFile(store);
        const bookmarkOutPath = path.join(dir, '../../bookmarks.html');
        await fs.promises.writeFile(bookmarkOutPath, chromeContent);
        console.log(`bookmarks created and saved to ${bookmarkOutPath}. Open chrome://settings/importData to import it!`);
        await store.close();
    }
};
//# sourceMappingURL=pin.js.map