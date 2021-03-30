import React from 'react';
import { Text } from 'ink';
/**
 * Display the number of bookmarks retrieved from Pinboard
 *
 * @param opts view data
 *
 * @returns
 */
export function LoadingPinboardView(opts) {
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null,
            "Retrieved ",
            opts.bookmarkCount,
            " Bookmarks From Pinboard \uD83D\uDCCC...")));
}
//# sourceMappingURL=LoadingPinboardView.js.map