import ink from 'ink';
import React from 'react';
import { Pin } from './components/Pin.js';
const { render } = ink;
/**
 * The core application
 *
 * @param args command-line arguments
 */
export const pin = async (args) => {
    const bookmarkPath = args['--bookmarks'];
    render(React.createElement(React.StrictMode, null,
        React.createElement(Pin, { bookmarkPath: bookmarkPath })), {});
};
//# sourceMappingURL=pin.js.map