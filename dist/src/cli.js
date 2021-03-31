#!/usr/bin/env node
import docopt from 'docopt';
import signale from 'signale';
import constants from './constants.js';
import { pin } from './pin.js';
const docs = `
Pin - Interact with Pinboard

Usage:
  pin edit [--bookmarks <fpath>]
  pin merge [--bookmarks <fpath>] [--not-dry-run]

Description:
  Sync bookmarks from Pinboard, add them to a folder, and save them to Chrome.

Options:
  --bookmarks <fpath>   the file-path of the bookmarks
  --not-dry-run         actually perform the merge, as opposed to showing the results safely.

License:
  The MIT License

  Copyright (c) 2021 Róisín Grannell

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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