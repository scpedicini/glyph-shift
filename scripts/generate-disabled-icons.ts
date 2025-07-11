import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// This is a simple placeholder script
// In a real implementation, you would use a library like sharp or jimp to convert icons to grayscale
// For now, we'll just copy the icons as-is and note that they should be manually edited

const sizes = ['16', '32', '48', '128'];
const srcDir = join(process.cwd(), 'public', 'icon');
const destDir = join(process.cwd(), 'public', 'icon-disabled');

console.log('Icon generation placeholder script');
console.log('Please manually create grayscale versions of the icons in public/icon-disabled/');
console.log('You can use image editing software to desaturate the colors');
console.log('The disabled icons are already copied to the destination directory');