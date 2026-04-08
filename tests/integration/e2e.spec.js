const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Rust WASM Toolkit - E2E Integration Tests', () => {
  const pkgDir = path.resolve(__dirname, '../../pkg');

  beforeAll(() => {
    // Build the WASM package before running tests
    execSync('wasm-pack build --target web --out-dir pkg', {
      cwd: path.resolve(__dirname, '../..'),
      timeout: 120000,
    });
  });

  it('produces valid .wasm binary after build', () => {
    const wasmPath = path.join(pkgDir, 'rust_wasm_toolkit_bg.wasm');
    expect(fs.existsSync(wasmPath)).toBe(true);
    const buffer = fs.readFileSync(wasmPath);
    // WASM magic number: \0asm
    expect(buffer[0]).toBe(0x00);
    expect(buffer[1]).toBe(0x61);
    expect(buffer[2]).toBe(0x73);
    expect(buffer[3]).toBe(0x6d);
  });

  it('generates JavaScript bindings with init function', () => {
    const jsPath = path.join(pkgDir, 'rust_wasm_toolkit.js');
    expect(fs.existsSync(jsPath)).toBe(true);
    const content = fs.readFileSync(jsPath, 'utf8');
    expect(content).toContain('export default function init');
  });

  it('generates TypeScript type definitions', () => {
    const dtsPath = path.join(pkgDir, 'rust_wasm_toolkit.d.ts');
    expect(fs.existsSync(dtsPath)).toBe(true);
    const content = fs.readFileSync(dtsPath, 'utf8');
    expect(content).toContain('export function');
  });

  it('loads WASM module in Node.js and calls greet()', async () => {
    const { greet } = await import(path.join(pkgDir, 'rust_wasm_toolkit.js'));
    const result = greet('World');
    expect(result).toBe('Hello, World!');
  });

  it('performs image processing via WASM (grayscale)', async () => {
    const { grayscale } = await import(path.join(pkgDir, 'rust_wasm_toolkit.js'));
    // RGBA pixel: red
    const input = new Uint8Array([255, 0, 0, 255]);
    const output = grayscale(input, 1, 1);
    // Grayscale of pure red: 0.299 * 255 ≈ 76
    expect(output[0]).toBeCloseTo(76, -1);
    expect(output[1]).toBeCloseTo(76, -1);
    expect(output[2]).toBeCloseTo(76, -1);
    expect(output[3]).toBe(255); // alpha unchanged
  });

  it('runs markdown parser and returns HTML', async () => {
    const { parse_markdown } = await import(path.join(pkgDir, 'rust_wasm_toolkit.js'));
    const html = parse_markdown('# Hello\n\nSome **bold** text.');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('handles large buffer without memory errors', async () => {
    const { process_buffer } = await import(path.join(pkgDir, 'rust_wasm_toolkit.js'));
    const largeBuffer = new Uint8Array(1024 * 1024); // 1 MB
    largeBuffer.fill(42);
    const result = process_buffer(largeBuffer);
    expect(result.length).toBe(largeBuffer.length);
  });

  it('exposes correct package.json metadata', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('rust-wasm-toolkit');
    expect(pkg.module).toMatch(/\.js$/);
    expect(pkg.types).toMatch(/\.d\.ts$/);
  });
});
