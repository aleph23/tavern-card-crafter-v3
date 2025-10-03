# PNG Metadata Implementation Guide

## Overview

This document explains how the PNG metadata embedding feature works in Tavern Card Crafter V3. The implementation allows character JSON data to be embedded directly into PNG image files using the PNG tEXt chunk specification.

## Problem Statement

The original issue (#2) reported that "The save PNG file does not have the character JSON object embedded into it." The previous implementation attempted to store JSON data in image pixels, which was incorrect and incompatible with the import function.

## Solution

We implemented a proper PNG metadata embedding system using PNG tEXt chunks, which is the standard way to store text metadata in PNG files.

## Technical Implementation

### 1. PNG File Structure

PNG files consist of chunks with the following structure:
- **Length** (4 bytes): Size of the data field
- **Type** (4 bytes): Chunk type (e.g., "tEXt", "IEND")
- **Data** (variable): Chunk data
- **CRC** (4 bytes): Cyclic redundancy check

### 2. tEXt Chunk Format

The tEXt chunk stores text metadata with:
- **Keyword**: Null-terminated string (e.g., "chara")
- **Text**: The actual text data (base64-encoded JSON)

### 3. Implementation Files

#### `src/utils/pngMetadata.ts`

This utility file provides the core functionality:

```typescript
export async function embedJsonInPng(
  arrayBuffer: ArrayBuffer,
  jsonData: string,
  keyword: string = 'chara'
): Promise<ArrayBuffer>
```

**Key Functions:**
- `embedJsonInPng()`: Main function that embeds JSON into PNG
- `createTextChunk()`: Creates a properly formatted tEXt chunk
- `findIENDPosition()`: Locates the IEND chunk (end of PNG)
- `calculateCRC()`: Computes CRC32 checksum for data integrity

#### `src/components/CharacterPreview.tsx`

Updated the `downloadWithImage()` function to:
1. Fetch the character image as a blob
2. Convert it to an ArrayBuffer
3. Call `embedJsonInPng()` to embed the character data
4. Create a download link with the modified PNG

### 4. Data Flow

```
Character Data (JSON)
    ↓
Base64 Encode
    ↓
Create tEXt Chunk with keyword "chara"
    ↓
Find IEND position in PNG
    ↓
Insert tEXt chunk before IEND
    ↓
Calculate CRC for integrity
    ↓
Download modified PNG
```

### 5. Compatibility

The implementation is fully compatible with the existing import function in `src/pages/Index.tsx`, which:
1. First tries to read the tEXt chunk with keyword "chara"
2. Decodes the base64 data
3. Parses the JSON
4. Falls back to string search if tEXt chunk is not found

## Testing

To test the implementation:

1. **Create a character card**:
   - Fill in character information
   - Upload a character avatar
   - Click "Export PNG"

2. **Verify the export**:
   - Check that the PNG file is downloaded
   - The file should contain the character image

3. **Test the import**:
   - Click "Import Card"
   - Select the exported PNG file
   - Verify that all character data is correctly imported

## Benefits

1. **Standards Compliant**: Uses PNG specification for metadata
2. **Reliable**: Proper CRC checksums ensure data integrity
3. **Compatible**: Works with existing import functionality
4. **Efficient**: Minimal overhead, no image quality loss
5. **Portable**: PNG files can be shared and imported anywhere

## Technical Details

### Base64 Encoding

The JSON data is base64-encoded before embedding to ensure:
- Safe storage of special characters
- Compatibility with PNG text chunks
- Easy decoding during import

### CRC32 Calculation

The CRC32 checksum ensures:
- Data integrity verification
- Detection of corrupted chunks
- PNG specification compliance

### IEND Chunk Position

The tEXt chunk is inserted before the IEND chunk because:
- IEND must always be the last chunk in a PNG file
- This maintains PNG file validity
- Standard PNG readers will ignore unknown chunks

## Error Handling

The implementation includes comprehensive error handling:
- Validates PNG file structure
- Checks for IEND chunk presence
- Catches and reports encoding errors
- Provides user-friendly error messages

## Future Enhancements

Possible improvements:
1. Support for compressed text chunks (zTXt)
2. Multiple metadata keywords
3. Metadata extraction utility
4. Validation of embedded data

## References

- [PNG Specification](http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html)
- [PNG Chunks](http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html)
- [tEXt Chunk Format](http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.tEXt)
