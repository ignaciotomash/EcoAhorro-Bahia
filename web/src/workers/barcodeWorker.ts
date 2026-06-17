import { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';

const hints = new Map<any, any>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
  [DecodeHintType.TRY_HARDER, true],
]);

const ctx = self as any;

ctx.onmessage = (event: { data: { data: ArrayBuffer; width: number; height: number } }) => {
  try {
    const { data, width, height } = event.data;
    const luminanceSource = new RGBLuminanceSource(new Uint8ClampedArray(data), width, height);
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
