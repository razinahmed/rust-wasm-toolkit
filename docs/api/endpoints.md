# WASM Module API Reference

## Installation

```bash
npm install rust-wasm-toolkit
```

## Initialization

```js
import init, { greet, grayscale, parse_markdown } from 'rust-wasm-toolkit';

await init(); // loads and compiles the .wasm binary
```

## Exported Functions

### `greet(name: string): string`

Returns a greeting string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Name to include in the greeting |

**Returns:** `"Hello, {name}!"`

### `grayscale(pixels: Uint8Array, width: number, height: number): Uint8Array`

Converts an RGBA pixel buffer to grayscale using luminance weights (BT.601).

| Parameter | Type | Description |
|-----------|------|-------------|
| `pixels` | `Uint8Array` | RGBA pixel data (length must equal `width * height * 4`) |
| `width` | `number` | Image width in pixels |
| `height` | `number` | Image height in pixels |

**Returns:** `Uint8Array` -- grayscale RGBA buffer (R=G=B=luminance, A unchanged)

### `adjust_brightness(pixels: Uint8Array, delta: i32): Uint8Array`

Adjusts brightness of every pixel by a signed delta, clamped to [0, 255].

| Parameter | Type | Description |
|-----------|------|-------------|
| `pixels` | `Uint8Array` | RGBA pixel data |
| `delta` | `number` | Brightness offset (-255 to 255) |

**Returns:** `Uint8Array` -- adjusted pixel buffer

### `parse_markdown(input: string): string`

Parses Markdown text and returns HTML.

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `string` | Markdown source text |

**Returns:** `string` -- rendered HTML

Supports: headings, bold/italic, code blocks with language tags, links, lists, blockquotes.

### `process_buffer(data: Uint8Array): Uint8Array`

General-purpose buffer processing (compression, transformation). Used for benchmarking WASM memory throughput.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Uint8Array` | Arbitrary byte buffer |

**Returns:** `Uint8Array` -- processed buffer

## JavaScript Wrapper Classes

### `WasmModule`

Manages WASM binary loading and lifecycle.

```js
const mod = new WasmModule('./pkg/rust_wasm_toolkit_bg.wasm');
await mod.init();
const exports = mod.getExports();
```

### `ImageProcessor`

Higher-level API for image manipulation.

| Method | Signature | Description |
|--------|-----------|-------------|
| `toGrayscale` | `(rgba, width, height) => Uint8Array` | Luminance conversion |
| `adjustBrightness` | `(rgba, delta) => Uint8Array` | Brightness offset |

### `BufferPool`

Object pool for `Uint8Array` instances to reduce GC pressure in hot loops.

| Method | Signature | Description |
|--------|-----------|-------------|
| `acquire(size)` | `(number) => Uint8Array` | Get a buffer from the pool |
| `release(buf)` | `(Uint8Array) => void` | Return a buffer to the pool |
| `size()` | `() => number` | Current number of pooled buffers |
