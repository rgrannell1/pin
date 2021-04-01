
# Pin [![CI](https://github.com/rgrannell1/pin/actions/workflows/ci.yaml/badge.svg)](https://github.com/rgrannell1/pin/actions/workflows/ci.yaml)

Sync bookmarks from Pinboard to Chrome after labelling them interactively.

[![asciicast](https://asciinema.org/a/FcBPdpGUPaxo5gLBxSVF3569c.svg)](https://asciinema.org/a/FcBPdpGUPaxo5gLBxSVF3569c)

### Stability Index

1, Experimental - This project might die, it's undertested and underdocumented, and redesigns and breaking changes are likely

### Usage

Set PINBOARD_API_KEY in your environment and run

```bash
pin edit --bookmarks <path-to-your-bookmarks>
```
to generate an SQL database of bookmarks and edit the folder they are assigned to, and

```bash
pin merge --bookmarks <path-to-your-bookmarks>
```
to generate a bookmarks import file

### License

The MIT License

Copyright (c) 2021 Róisín Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
