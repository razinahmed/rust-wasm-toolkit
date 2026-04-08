use wasm_bindgen::prelude::*;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>,
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        // Extremely complex Conway's Game of Life logic here to demonstrate WASM compute speeds.
        println!("Computing next generation...");
    }
    pub fn new() -> Universe {
        Universe { width: 64, height: 64, cells: vec![0; 64*64] }
    }
}