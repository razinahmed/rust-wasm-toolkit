# Architecture

## Overview

Rust WASM Toolkit compiles a set of Rust libraries into WebAssembly modules and provides JavaScript/TypeScript bindings for use in browsers and Node.js. The primary modules cover image processing, Markdown parsing, and general buffer operations -- chosen because they demonstrate where WASM outperforms pure JavaScript.

## Build Pipeline

```
Rust Source (src/lib.rs)
    |
    v
wasm-pack build (cargo + wasm-bindgen)
    |
    v
pkg/
  ├── rust_wasm_toolkit_bg.wasm   # Compiled WASM binary
  ├── rust_wasm_toolkit.js         # JS bindings (ESM)
  ├── rust_wasm_toolkit.d.ts       # TypeScript definitions
  └── package.json                 # npm-publishable package
```

**wasm-pack** orchestrates the build:
1. Compiles Rust to `wasm32-unknown-unknown` target
2. Runs `wasm-bindgen` to generate JS glue code and TypeScript types
3. Runs `wasm-opt` (via `wasm-pack --release`) to shrink the binary

## Rust Side

### Crate Layout

```
src/
  lib.rs          # #[wasm_bindgen] entry points
  image.rs        # Pixel manipulation algorithms
  markdown.rs     # Markdown-to-HTML parser (wraps pulldown-cmark)
  buffer.rs       # Buffer processing utilities
Cargo.toml        # wasm-bindgen, pulldown-cmark dependencies
```

### Memory Model

WASM operates on a linear memory buffer. When JavaScript passes a `Uint8Array` to a WASM function:
1. The JS bindings copy the array into WASM linear memory
2. Rust operates on the slice in-place
3. The result is copied back to a new JS `Uint8Array`

For large buffers, the `BufferPool` on the JS side reduces allocation churn.

## JavaScript Side

### Wrapper Layer (`src/js/`)

```
src/js/
  wasm-loader.js      # WasmModule class -- loads and initializes .wasm
  image-processor.js   # ImageProcessor -- higher-level image API
  markdown-engine.js   # MarkdownEngine -- renders Markdown to HTML
  buffer-pool.js       # BufferPool -- typed array object pool
```

The wrapper layer adds:
- **Lazy initialization** -- WASM binary loads on first use, not on import
- **Input validation** -- checks dimensions and byte lengths before crossing the JS/WASM boundary
- **Error mapping** -- converts WASM traps into descriptive JavaScript errors

## Performance Characteristics

| Operation | Pure JS | WASM | Speedup |
|-----------|---------|------|---------|
| Grayscale 1080p image | ~45ms | ~8ms | ~5.6x |
| Markdown 10KB doc | ~12ms | ~3ms | ~4x |
| Buffer XOR 1MB | ~6ms | ~1ms | ~6x |

Benchmarks measured on Chrome 120, M1 MacBook Air.

## Integration Patterns

### Browser

```js
import init, { grayscale } from 'rust-wasm-toolkit';
await init(); // fetches .wasm from same origin
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const result = grayscale(imageData.data, canvas.width, canvas.height);
ctx.putImageData(new ImageData(result, canvas.width, canvas.height), 0, 0);
```

### Node.js

```js
const { WasmModule } = require('rust-wasm-toolkit');
const mod = new WasmModule('./pkg/rust_wasm_toolkit_bg.wasm');
await mod.init();
const { parse_markdown } = mod.getExports();
console.log(parse_markdown('# Hello'));
```

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Rust unit tests | `cargo test` | Algorithm correctness |
| JS unit tests | Jest | Wrapper validation, error handling |
| E2E integration | Jest + wasm-pack | Full build-to-invocation pipeline |
| Benchmarks | Criterion (Rust) + Benchmark.js | Performance regression detection |
