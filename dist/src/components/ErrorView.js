import React from 'react';
import { Text } from 'ink';
/**
 * View errors generated by the application.
 *
 * @param opts view options
 *
 * @returns
 */
export function ErrorView(opts) {
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null,
            "Error: ",
            opts.message)));
}
//# sourceMappingURL=ErrorView.js.map