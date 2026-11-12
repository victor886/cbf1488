# Charts engine notice

The files under this directory are derived from
[victory-native](https://github.com/FormidableLabs/victory-native-xl)
(NearForm / Formidable Labs), adapted for HeroUI Native Pro:

- Package rename: `@shopify/react-native-skia` → `react-native-skia` (Skia v3)
- Mutable `SkPath` construction rewritten to the immutable Skia v3 `PathBuilder` API
- Scope: cartesian, polar, and pie chart engines (victory-native is no longer a dependency)

Upstream declares the MIT license in its `package.json` and README but ships no
`LICENSE` file, so the copyright holder below is taken from the project's
authorship. The original license terms are reproduced in full.

## victory-native license

MIT License

Copyright (c) Formidable Labs, Inc. (now NearForm) and victory-native contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
