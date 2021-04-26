import React from 'react';
import { Text, Box } from 'ink';
/**
 * Render bookmark information and the edit pane
 *
 * @param opts view data
 *
 * @returns
 */
export function LoadedPinboardView(opts) {
    const { bookmark, folder: savedFolder } = opts;
    let defaultFolder = opts.active ? '' : 'none';
    if (typeof savedFolder !== 'undefined') {
        defaultFolder = savedFolder.folder;
    }
    const edit = opts.active ? '    edit' : '';
    const folder = typeof opts.folderBuffer !== 'undefined' && opts.folderBuffer.length > 0
        ? opts.folderBuffer.join('')
        : defaultFolder;
    const predictedFolder = opts.predictedFolder ?? '';
    const textData = React.createElement(Box, null,
        React.createElement(Text, null,
            " ",
            folder),
        React.createElement(Text, { color: '#005cc5', inverse: true }, predictedFolder));
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null, "\uD83D\uDCCC "),
        React.createElement(Text, { inverse: true },
            (opts.cursor ?? 0) + 1,
            " / ",
            opts.bookmarkCount,
            edit),
        React.createElement(Text, null, " "),
        React.createElement(Text, { bold: true }, "folder:"),
        textData,
        React.createElement(Text, { bold: true }, "href:"),
        React.createElement(Text, null,
            "  ",
            bookmark?.href),
        React.createElement(Text, { bold: true }, "description:"),
        React.createElement(Text, null,
            "  ",
            bookmark?.description)));
}
//# sourceMappingURL=LoadedPinboardView.js.map