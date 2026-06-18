import { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';

const hints = new Map<any, any>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
  [DecodeHintType.TRY_HARDER, true],
]);

const ctx = self as any;

function rgbaToLuminance(rgba: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const size = width * height;
  const luminances = new Uint8ClampedArray(size);
  for (let i = 0; i < size; i++) {
    const o = i * 4;
    // Green-favouring average cheaply (same formula ZXing uses for Int32Array)
    luminances[i] = ((rgba[o] + 2 * rgba[o + 1] + rgba[o + 2]) / 4) & 0xFF;
  }
  return luminances;
}

ctx.onmessage = (event: { data: { data: ArrayBuffer; width: number; height: number } }) => {
  try {
    const { data, width, height } = event.data;
    const rgba = new Uint8ClampedArray(data);
    const luminances = rgbaToLuminance(rgba, width, height);
    const luminanceSource = new RGBLuminanceSource(luminances, width, height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const reader = new MultiFormatReader();
    const result = reader.decode(binaryBitmap, hints);
    if (result) {
      ctx.postMessage({ ean: result.getText() });
      return;
    }
  } catch {
    // No barcode found
  }
  ctx.postMessage({ error: 'not found' });
};
