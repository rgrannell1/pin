import ink from 'ink';
import * as path from 'path';
import React from 'react';
import { Chrome } from './apis/chrome.js';
import { Pin } from './components/Pin.js';
const { render } = ink;
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Store } from './store.js';
const dir = dirname(fileURLToPath(import.meta.url));
const fpath = path.join(dir, '../../data/data.db');
/**
 * The core application
 *
 * @param args command-line arguments
 */
export const pin = async (args) => {
    const bookmarkPath = args['--bookmarks'];
    if (args.edit) {
        render(React.createElement(React.StrictMode, null,
            React.createElement(Pin, { bookmarkPath: bookmarkPath })), {});
    }
    else {
        const chrome = new Chrome(bookmarkPath);
        const store = new Store(fpath);
        const file = await chrome.asBookmarkFile(store);
        console.log(file);
    }
};
//# sourceMappingURL=pin.js.map