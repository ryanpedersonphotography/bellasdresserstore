#!/usr/bin/env node

/**
 * Image optimization script for converting images to WebP/AVIF
 * Run: node scripts/optimize-images.js
 */

import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT_DIR = path.join(__dirname, '../public/images')
const OUTPUT_DIR = path.join(__dirname, '../public/images/optimized')

// Ensure output directory exists
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err)
  }
}

// Optimize a single image
async function optimizeImage(inputPath, filename) {
  const name = path.parse(filename).name
  
  try {
    // Check file size
    const stats = await fs.stat(inputPath)
    const fileSizeInKB = stats.size / 1024
    
    // Only process images larger than 300KB
    if (fileSizeInKB > 300) {
      console.log(`Optimizing ${filename} (${fileSizeInKB.toFixed(2)}KB)...`)
      
      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(path.join(OUTPUT_DIR, `${name}.webp`))
      
      // Convert to AVIF for even better compression
      await sharp(inputPath)
        .avif({ quality: 80 })
        .toFile(path.join(OUTPUT_DIR, `${name}.avif`))
      
      console.log(`✓ Converted ${filename} to WebP and AVIF`)
    } else {
      console.log(`Skipping ${filename} (${fileSizeInKB.toFixed(2)}KB) - already optimized`)
    }
  } catch (err) {
    console.error(`Error optimizing ${filename}:`, err)
  }
}

// Main function
async function main() {
  await ensureDir(OUTPUT_DIR)
  
  try {
    const files = await fs.readdir(INPUT_DIR)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    )
    
    console.log(`Found ${imageFiles.length} images to process...\n`)
    
    for (const file of imageFiles) {
      await optimizeImage(path.join(INPUT_DIR, file), file)
    }
    
    console.log('\n✨ Image optimization complete!')
  } catch (err) {
    console.error('Error reading directory:', err)
  }
}

main()