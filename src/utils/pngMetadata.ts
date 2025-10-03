/**
 * Embeds JSON metadata into a PNG file using tEXt chunks
 * This follows the PNG specification for text metadata
 */
export async function embedMetadataInPNG(
  imageDataUrl: string,
  metadata: any,
  keyword: string = 'chara'
): Promise<Blob> {
  // Convert data URL to blob
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Encode metadata as base64
  const jsonString = JSON.stringify(metadata);
  const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

  // Create tEXt chunk
  const textChunk = createTextChunk(keyword, base64Data);

  // Find IEND chunk position (last 12 bytes of a valid PNG)
  const iendPosition = findIENDPosition(uint8Array);

  if (iendPosition === -1) {
    throw new Error('Invalid PNG file: IEND chunk not found');
  }

  // Insert tEXt chunk before IEND
  const newPngData = new Uint8Array(uint8Array.length + textChunk.length);
  newPngData.set(uint8Array.slice(0, iendPosition), 0);
  newPngData.set(textChunk, iendPosition);
  newPngData.set(uint8Array.slice(iendPosition), iendPosition + textChunk.length);

  return new Blob([newPngData], { type: 'image/png' });
}

/**
 * Creates a PNG tEXt chunk with the given keyword and text
 */
function createTextChunk(keyword: string, text: string): Uint8Array {
  // Encode keyword and text
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);

  // Calculate chunk length (keyword + null separator + text)
  const dataLength = keywordBytes.length + 1 + textBytes.length;

  // Create chunk: length (4) + type (4) + data (variable) + CRC (4)
  const chunk = new Uint8Array(4 + 4 + dataLength + 4);
  const view = new DataView(chunk.buffer);

  // Write length (big-endian)
  view.setUint32(0, dataLength, false);

  // Write chunk type "tEXt"
  chunk[4] = 0x74; // 't'
  chunk[5] = 0x45; // 'E'
  chunk[6] = 0x58; // 'X'
  chunk[7] = 0x74; // 't'

  // Write keyword
  chunk.set(keywordBytes, 8);

  // Write null separator
  chunk[8 + keywordBytes.length] = 0;

  // Write text
  chunk.set(textBytes, 8 + keywordBytes.length + 1);

  // Calculate and write CRC
  const crc = calculateCRC(chunk.slice(4, 4 + 4 + dataLength));
  view.setUint32(4 + 4 + dataLength, crc, false);

  return chunk;
}

/**
 * Finds the position of the IEND chunk in a PNG file
 */
function findIENDPosition(data: Uint8Array): number {
  // IEND chunk is always at the end: length(4) + "IEND"(4) + CRC(4) = 12 bytes
  // Search for IEND signature: 0x49 0x45 0x4E 0x44
  for (let i = data.length - 12; i >= 8; i--) {
    if (data[i] === 0x49 && data[i + 1] === 0x45 && data[i + 2] === 0x4E && data[i + 3] === 0x44) {
      return i - 4; // Return position before length field
    }
  }
  return -1;
}

/**
 * Calculates CRC32 for PNG chunks
 */
function calculateCRC(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}
