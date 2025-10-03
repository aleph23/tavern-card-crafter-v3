# Changelog

## [Unreleased] - 2025-10-03

### Fixed
- **PNG Export with Embedded JSON**: Fixed the issue where the character JSON object was not being saved to the PNG file

### Changed
- **PNG Metadata Embedding**: Replaced the incorrect pixel-based JSON embedding method with proper PNG tEXt chunk embedding
  - The previous implementation tried to store JSON data in image pixels, which was incompatible with the import function
  - The new implementation uses the PNG specification's tEXt chunk format to embed metadata
  - JSON data is now base64-encoded and stored in a tEXt chunk with the keyword "chara"
  - This matches the format expected by the import function in `src/pages/Index.tsx`

### Added
- **New Utility Module**: Created `src/utils/pngMetadata.ts` with the following functions:
  - `embedJsonInPng()`: Main function to embed JSON data into PNG files
  - `createTextChunk()`: Creates a properly formatted PNG tEXt chunk
  - `findIENDPosition()`: Locates the IEND chunk in a PNG file
  - `calculateCRC()`: Calculates CRC32 checksums for PNG chunks

### Technical Details

#### PNG tEXt Chunk Format
The implementation follows the PNG specification for text chunks:
1. **Chunk Structure**: Length (4 bytes) + Type "tEXt" (4 bytes) + Data (variable) + CRC (4 bytes)
2. **Data Format**: Keyword + null separator (0x00) + text content
3. **Keyword**: "chara" (standard for character card metadata)
4. **Text Content**: Base64-encoded JSON data
5. **Insertion Point**: Before the IEND chunk (end of PNG file)

#### Compatibility
- The export format is fully compatible with the existing import function
- The import function already looks for the "chara" keyword in tEXt chunks
- Base64 encoding/decoding is handled correctly on both export and import
- Fallback string search method in import function provides additional robustness

#### Files Modified
- `src/components/CharacterPreview.tsx`: Updated `downloadWithImage()` function to use the new PNG metadata utility
- `src/utils/pngMetadata.ts`: New file with PNG metadata embedding functionality

#### Testing Recommendations
1. Export a character card as PNG with the new implementation
2. Import the exported PNG file to verify the JSON data is correctly embedded and extracted
3. Verify that the character data matches the original after import
