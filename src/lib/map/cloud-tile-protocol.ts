/**
 * Converts GIBS Band 13 infrared tiles into transparent cloud overlays.
 * MapLibre cannot derive per-pixel alpha from raster luminance, so tiles are
 * processed on arrival: warm clear sky becomes transparent and cold clouds
 * remain visible.
 *
 * Two cloud styles share the protocol loader, chosen by the first path
 * segment of the request URL (`<scheme>://<style>/https://…`):
 * `shaded` keeps the source greys; `white` repaints clouds white.
 */

/** URL scheme the cloud raster sources request tiles through. */
export const CLOUD_TILE_SCHEME = 'gibs-ir-clouds';

/** Cloud rendering treatment applied by the tile protocol. */
export type CloudTileStyle = 'shaded' | 'white';

// GIBS maps warm clear sky to dark pixels and cold cloud tops to bright ones.
// Smoothstep keeps cloud edges soft; warm low cloud may fade with clear sky.
const LUM_CLEAR = 0.4;
const LUM_CLOUD = 0.85;
const TILE_SIZE = 256;

/**
 * Cloud opacity for a pixel's luminance (0..1) — 0 for clear-sky
 * temperatures, 1 for cold cloud tops, smoothstepped between.
 */
export function cloudAlpha(luminance: number): number {
	const t = Math.min(1, Math.max(0, (luminance - LUM_CLEAR) / (LUM_CLOUD - LUM_CLEAR)));
	return t * t * (3 - 2 * t);
}

/** Split a protocol request URL into its cloud style and the real tile URL. */
export function parseCloudTileUrl(requestUrl: string): { style: CloudTileStyle; url: string } {
	const rest = requestUrl.slice(requestUrl.indexOf('://') + 3);
	const slash = rest.indexOf('/');
	const style = rest.slice(0, slash);
	return {
		style: style === 'white' ? 'white' : 'shaded',
		url: rest.slice(slash + 1)
	};
}

/** A fully transparent tile, for requests beyond the imagery's extent. */
function blankTile(): ImageBitmap {
	return new OffscreenCanvas(TILE_SIZE, TILE_SIZE).transferToImageBitmap();
}

/** Fetch and repaint a GIBS tile for MapLibre's custom protocol API. */
export async function loadCloudTile(
	params: { url: string },
	abortController: AbortController
): Promise<{ data: ImageBitmap }> {
	const { style, url } = parseCloudTileUrl(params.url);
	const response = await fetch(url, { signal: abortController.signal });
	// Tiles outside Himawari's disc return non-images; keep the overlay blank.
	if (!response.ok || !(response.headers.get('content-type') ?? '').startsWith('image/')) {
		return { data: blankTile() };
	}

	const bitmap = await createImageBitmap(await response.blob());
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) {
		bitmap.close();
		throw new Error('Cloud tiles require an OffscreenCanvas 2D context');
	}
	ctx.drawImage(bitmap, 0, 0);
	bitmap.close();

	const image = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
	const pixels = image.data;
	for (let i = 0; i < pixels.length; i += 4) {
		// The source is greyscale; preserve transparency outside the satellite disc.
		const alpha = cloudAlpha(pixels[i] / 255) * (pixels[i + 3] / 255);
		if (style === 'white') {
			pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
		}
		pixels[i + 3] = Math.round(alpha * 255);
	}
	ctx.putImageData(image, 0, 0);

	return { data: canvas.transferToImageBitmap() };
}
