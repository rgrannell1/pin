#!/usr/bin/env node
import docopt from 'docopt';
import signale from 'signale';
import constants from './constants.js';
import { pin } from './pin.js';
const docs = `
Pin - Interact with Pinboard

Usage:
  pin edit [--bookmarks <fpath>]

Description:
  Sync bookmarks from Pinboard, add them to a folder, and save them to Chrome.
`;
const main = async () => {
    const args = docopt.docopt(docs, {});
    await pin(args);
};
main().catch((err) => {
    signale.error(`${constants.codes.UNCAUGHT_FATAL}: uncaught error: ${err?.message}\n${err?.stack ?? ''}`);
    throw err;
});
//# sourceMappingURL=cli.js.map