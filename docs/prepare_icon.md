# Prepare Icons for Chrome Extension

This document describes how to generate all required icon sizes for the Chrome extension from a single source image.

## Prerequisites

- ImageMagick installed on your system
- Source icon file: `icon1024x1024.png`

## Icon Generation Process

### 1. Generate Regular Icons

Generate all required icon sizes from the source image:

```bash
magick icon1024x1024.png -resize 16x16 public/icon/16.png
magick icon1024x1024.png -resize 32x32 public/icon/32.png
magick icon1024x1024.png -resize 48x48 public/icon/48.png
magick icon1024x1024.png -resize 96x96 public/icon/96.png
magick icon1024x1024.png -resize 128x128 public/icon/128.png
```

Or as a single command:

```bash
magick icon1024x1024.png -resize 16x16 public/icon/16.png && \
magick icon1024x1024.png -resize 32x32 public/icon/32.png && \
magick icon1024x1024.png -resize 48x48 public/icon/48.png && \
magick icon1024x1024.png -resize 96x96 public/icon/96.png && \
magick icon1024x1024.png -resize 128x128 public/icon/128.png
```

### 2. Generate Grayscale Disabled Icons

Generate grayscale versions for disabled states:

```bash
magick icon1024x1024.png -colorspace Gray -resize 16x16 public/icon-disabled/16.png
magick icon1024x1024.png -colorspace Gray -resize 32x32 public/icon-disabled/32.png
magick icon1024x1024.png -colorspace Gray -resize 48x48 public/icon-disabled/48.png
magick icon1024x1024.png -colorspace Gray -resize 96x96 public/icon-disabled/96.png
magick icon1024x1024.png -colorspace Gray -resize 128x128 public/icon-disabled/128.png
```

Or as a single command:

```bash
magick icon1024x1024.png -colorspace Gray -resize 16x16 public/icon-disabled/16.png && \
magick icon1024x1024.png -colorspace Gray -resize 32x32 public/icon-disabled/32.png && \
magick icon1024x1024.png -colorspace Gray -resize 48x48 public/icon-disabled/48.png && \
magick icon1024x1024.png -colorspace Gray -resize 96x96 public/icon-disabled/96.png && \
magick icon1024x1024.png -colorspace Gray -resize 128x128 public/icon-disabled/128.png
```

## Required Icon Sizes

The Chrome extension requires the following icon sizes:
- 16x16 pixels
- 32x32 pixels
- 48x48 pixels
- 96x96 pixels
- 128x128 pixels

These sizes are configured in `wxt.config.ts` for the extension's browser action.