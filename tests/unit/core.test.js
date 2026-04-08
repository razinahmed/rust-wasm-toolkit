/**
 * Unit tests for the JavaScript interop layer of rust-wasm-toolkit.
 * These test the JS wrapper functions that bridge between the browser API
 * and the raw WASM exports.
 */

const { WasmModule } = require('../../src/js/wasm-loader');
const { ImageProcessor } = require('../../src/js/image-processor');
const { MarkdownEngine } = require('../../src/js/markdown-engine');
const { BufferPool } = require('../../src/js/buffer-pool');

describe('WasmModule Loader', () => {
  it('initializes with a valid WASM binary path', async () => {
    const mod = new WasmModule('./pkg/rust_wasm_toolkit_bg.wasm');
    await mod.init();
    expect(mod.isReady()).toBe(true);
  });

  it('throws on invalid WASM path', async () => {
    const mod = new WasmModule('./nonexistent.wasm');
    await expect(mod.init()).rejects.toThrow(/Failed to load/);
  });

  it('exposes exported functions after init', async () => {
    const mod = new WasmModule('./pkg/rust_wasm_toolkit_bg.wasm');
    await mod.init();
    const exports = mod.getExports();
    expect(exports).toHaveProperty('greet');
    expect(exports).toHaveProperty('grayscale');
    expect(exports).toHaveProperty('parse_markdown');
  });

  it('prevents calling exports before init', () => {
    const mod = new WasmModule('./pkg/rust_wasm_toolkit_bg.wasm');
    expect(() => mod.getExports()).toThrow(/not initialized/);
  });
});

describe('ImageProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new ImageProcessor();
  });

  it('converts RGBA pixels to grayscale using luminance weights', () => {
    const rgba = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]);
    const result = processor.toGrayscale(rgba, 2, 1);
    // Red luminance: 0.299 * 255 ≈ 76
    expect(result[0]).toBeCloseTo(76, -1);
    // Green luminance: 0.587 * 255 ≈ 150
    expect(result[4]).toBeCloseTo(150, -1);
  });

  it('preserves alpha channel during grayscale conversion', () => {
    const rgba = new Uint8Array([100, 150, 200, 128]);
    const result = processor.toGrayscale(rgba, 1, 1);
    expect(result[3]).toBe(128);
  });

  it('rejects input with invalid byte length', () => {
    const bad = new Uint8Array([1, 2, 3]); // not multiple of 4
    expect(() => processor.toGrayscale(bad, 1, 1)).toThrow(/byte length/);
  });

  it('applies brightness adjustment', () => {
    const rgba = new Uint8Array([100, 100, 100, 255]);
    const result = processor.adjustBrightness(rgba, 50);
    expect(result[0]).toBe(150);
    expect(result[1]).toBe(150);
    expect(result[2]).toBe(150);
  });

  it('clamps brightness to 0-255 range', () => {
    const rgba = new Uint8Array([200, 200, 200, 255]);
    const result = processor.adjustBrightness(rgba, 100);
    expect(result[0]).toBe(255);
  });
});

describe('MarkdownEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new MarkdownEngine();
  });

  it('converts headings to HTML', () => {
    expect(engine.render('# Title')).toContain('<h1>Title</h1>');
    expect(engine.render('## Subtitle')).toContain('<h2>Subtitle</h2>');
  });

  it('converts bold and italic syntax', () => {
    expect(engine.render('**bold**')).toContain('<strong>bold</strong>');
    expect(engine.render('*italic*')).toContain('<em>italic</em>');
  });

  it('converts code blocks with language tag', () => {
    const md = '```rust\nfn main() {}\n```';
    const html = engine.render(md);
    expect(html).toContain('<code class="language-rust">');
    expect(html).toContain('fn main()');
  });

  it('returns empty string for empty input', () => {
    expect(engine.render('')).toBe('');
  });
});

describe('BufferPool', () => {
  it('allocates and returns typed arrays of requested size', () => {
    const pool = new BufferPool(4);
    const buf = pool.acquire(1024);
    expect(buf).toBeInstanceOf(Uint8Array);
    expect(buf.length).toBe(1024);
  });

  it('reuses released buffers instead of allocating new ones', () => {
    const pool = new BufferPool(2);
    const buf1 = pool.acquire(256);
    pool.release(buf1);
    const buf2 = pool.acquire(256);
    expect(buf2.buffer).toBe(buf1.buffer);
  });

  it('respects pool size limit', () => {
    const pool = new BufferPool(1);
    const buf1 = pool.acquire(128);
    const buf2 = pool.acquire(128);
    pool.release(buf1);
    pool.release(buf2);
    expect(pool.size()).toBe(1);
  });
});
