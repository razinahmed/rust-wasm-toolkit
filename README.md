<div align="center">

<img src="https://placehold.co/900x200/0a0a23/f74c00.png?text=Rust+WebAssembly+Toolkit&font=Montserrat" alt="Rust WebAssembly Toolkit Banner" width="100%" />

# Rust WebAssembly Toolkit

**Starter kit for compiling high-performance Rust into WebAssembly — wasm-pack, wasm-bindgen, JavaScript interop, benchmarks, and production-ready build pipeline.**

[![Rust](https://img.shields.io/badge/Rust-1.75-f74c00?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-654ff0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)
[![wasm-pack](https://img.shields.io/badge/wasm--pack-0.12-f5a623?style=for-the-badge&logo=rust&logoColor=white)](https://rustwasm.github.io/wasm-pack/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

[Getting Started](#-getting-started) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Benchmarks](#-benchmarks) · [Contributing](#-contributing)

</div>

---

## :sparkles: Features

| Feature | Description |
|---|---|
| :package: **wasm-pack Build Pipeline** | One-command compilation from Rust to optimized `.wasm` binaries with npm package output |
| :electric_plug: **wasm-bindgen JS Interop** | Seamless two-way data passing between Rust and JavaScript with auto-generated bindings |
| :shield: **Memory-safe Computations** | Leverage Rust's ownership model for zero-cost abstractions in browser workloads |
| :globe_with_meridians: **Browser & Node.js Support** | Target both browser ESM bundles and Node.js CommonJS modules from a single codebase |
| :bar_chart: **Performance Benchmarks** | Built-in benchmark suite comparing WASM vs. native JS for common compute tasks |
| :evergreen_tree: **Tree-shaking** | Dead code elimination ensures minimal bundle size for production deploys |
| :world_map: **Source Maps** | Debug-friendly source maps mapping `.wasm` back to original Rust source |
| :gear: **CI/CD** | GitHub Actions pipeline for build, test, benchmark, and npm publish |

---

## :hammer_and_wrench: Tech Stack

| Technology | Purpose |
|---|---|
| ![Rust](https://img.shields.io/badge/Rust-f74c00?style=flat-square&logo=rust&logoColor=white) | Systems programming language |
| ![WebAssembly](https://img.shields.io/badge/WebAssembly-654ff0?style=flat-square&logo=webassembly&logoColor=white) | Binary instruction format for the web |
| ![wasm-pack](https://img.shields.io/badge/wasm--pack-f5a623?style=flat-square&logo=rust&logoColor=white) | Build, test, and publish WASM packages |
| ![wasm-bindgen](https://img.shields.io/badge/wasm--bindgen-8b5cf6?style=flat-square&logo=rust&logoColor=white) | Rust/JS interop layer |
| ![JavaScript](https://img.shields.io/badge/JavaScript-f7df1e?style=flat-square&logo=javascript&logoColor=black) | Host language and integration tests |
| ![webpack](https://img.shields.io/badge/webpack-8dd6f9?style=flat-square&logo=webpack&logoColor=black) | Module bundler with WASM support |

---

## :package: Installation

### Prerequisites

- **Rust** >= 1.75 — [Install via rustup](https://rustup.rs/)
- **wasm-pack** — `cargo install wasm-pack`
- **Node.js** >= 18.x (for JS integration and benchmarks)
- **npm** >= 9.x

### Getting Started

```bash
# Clone the repository
git clone https://github.com/razinahmed/rust-wasm-toolkit.git

# Navigate to the project
cd rust-wasm-toolkit

# Build the WASM package
wasm-pack build --target web

# Install JS dependencies for the demo app
cd www && npm install

# Start the development server
npm run start
```

### Build Targets

```bash
# Browser (ESM)
wasm-pack build --target web --release

# Node.js (CommonJS)
wasm-pack build --target nodejs --release

# Bundler (webpack/rollup)
wasm-pack build --target bundler --release
```

---

## :open_file_folder: Project Structure

```
rust-wasm-toolkit/
├── src/
│   ├── lib.rs              # Main library entry point
│   ├── math.rs             # Math computation modules
│   ├── string_ops.rs       # String processing utilities
│   ├── crypto.rs           # Hashing and encoding
│   └── utils.rs            # Shared helpers and panic hook
├── www/
│   ├── index.html          # Demo application
│   ├── index.js            # JS integration layer
│   ├── webpack.config.js   # Bundler configuration
│   └── package.json
├── benches/
│   ├── wasm_bench.rs       # Rust-side benchmarks
│   └── js_bench.mjs        # JS comparison benchmarks
├── tests/
│   ├── web.rs              # WASM integration tests
│   └── node_tests.mjs      # Node.js integration tests
├── Cargo.toml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## :zap: Usage

### Rust Side — Exposing Functions

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let (mut a, mut b) = (0u64, 1u64);
            for _ in 2..=n {
                let temp = b;
                b = a + b;
                a = temp;
            }
            b
        }
    }
}
```

### JavaScript Side — Consuming WASM

```javascript
import init, { fibonacci } from './pkg/rust_wasm_toolkit.js';

async function main() {
  await init();
  const result = fibonacci(50);
  console.log(`Fibonacci(50) = ${result}`); // Computed in ~nanoseconds
}

main();
```

---

## :bar_chart: Benchmarks

| Operation | JavaScript | WASM (Rust) | Speedup |
|---|---|---|---|
| Fibonacci(40) | 820ms | 12ms | **~68x** |
| SHA-256 (1MB) | 145ms | 18ms | **~8x** |
| Matrix Multiply (512x512) | 1,200ms | 85ms | **~14x** |

> Run benchmarks locally: `npm run bench`

---

## :handshake: Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/new-module`
3. **Commit** your changes — `git commit -m "feat: add new computation module"`
4. **Push** to the branch — `git push origin feature/new-module`
5. **Open** a Pull Request

Please ensure all tests pass with `wasm-pack test --headless --firefox` before submitting.

---

## :scroll: License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with :heart: by [Razin Ahmed](https://github.com/razinahmed)**

`Rust` `WebAssembly` `WASM` `wasm-pack` `High Performance` `Browser` `Rust to JS`

</div>
