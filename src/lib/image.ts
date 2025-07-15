import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Storage bucket configuration
export const STORAGE_BUCKET = 'product-images';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// Image processing options
export interface ImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export interface ImageUploadResult {
	success: boolean;
	url?: string;
	path?: string;
	error?: string;
}

/**
 * Upload a product image to Supabase Storage
 */
export async function uploadProductImage(
	file: File,
	productSku: string,
	imageIndex: number = 0
): Promise<ImageUploadResult> {
	try {
		// Validate file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			return { success: false, error: validation.error };
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
		const fileName = `${productSku}-${imageIndex}-${Date.now()}.${fileExt}`;
		const filePath = `products/${productSku}/${fileName}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(filePath, file, {
				cacheControl: '31536000', // 1 year cache
				upsert: false
			});

		if (error) {
			console.error('Storage upload error:', error);
			return { success: false, error: error.message };
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from(STORAGE_BUCKET)
			.getPublicUrl(filePath);

		return {
			success: true,
			url: urlData.publicUrl,
			path: filePath
		};
	} catch (error) {
		console.error('Image upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Upload failed'
		};
	}
}

/**
 * Delete a product image from Supabase Storage
 */
export async function deleteProductImage(imagePath: string): Promise<boolean> {
	try {
		const { error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.remove([imagePath]);

		if (error) {
			console.error('Delete image error:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Delete image error:', error);
		return false;
	}
}

/**
 * Generate optimized image URL with Supabase's transformation API
 */
export function getOptimizedImageUrl(
	originalUrl: string,
	options: ImageOptions = {}
): string {
	if (!originalUrl || !originalUrl.includes('supabase')) {
		return originalUrl;
	}

	const url = new URL(originalUrl);
	const params = new URLSearchParams();

	// Add transformation parameters
	if (options.width) params.set('width', options.width.toString());
	if (options.height) params.set('height', options.height.toString());
	if (options.quality) params.set('quality', Math.min(100, Math.max(1, options.quality)).toString());
	if (options.format) params.set('format', options.format);

	// Default optimizations
	if (!params.has('quality')) params.set('quality', '85');
	if (!params.has('format')) params.set('format', 'webp');

	// Add parameters to URL
	if (params.toString()) {
		url.search = params.toString();
	}

	return url.toString();
}

/**
 * Get multiple image sizes for responsive design
 */
export function getResponsiveImageUrls(originalUrl: string) {
	return {
		thumbnail: getOptimizedImageUrl(originalUrl, { width: 150, height: 150 }),
		small: getOptimizedImageUrl(originalUrl, { width: 300, height: 300 }),
		medium: getOptimizedImageUrl(originalUrl, { width: 600, height: 600 }),
		large: getOptimizedImageUrl(originalUrl, { width: 1200, height: 1200 }),
		original: originalUrl
	};
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File size too large. Maximum allowed is ${MAX_FILE_SIZE / 1024 / 1024}MB`
		};
	}

	// Check file type
	if (!ALLOWED_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
		};
	}

	return { valid: true };
}

/**
 * Process and parse image URLs from various formats
 */
export function parseProductImages(images: string[] | any): string[] {
	if (!images) return [];

	// Handle array of strings
	if (Array.isArray(images)) {
		return images.filter(url => typeof url === 'string' && url.length > 0);
	}

	// Handle JSONB string
	if (typeof images === 'string') {
		try {
			const parsed = JSON.parse(images);
			if (Array.isArray(parsed)) {
				return parsed.filter(url => typeof url === 'string' && url.length > 0);
			}
		} catch {
			// If JSON parsing fails, treat as single URL
			return images.length > 0 ? [images] : [];
		}
	}

	return [];
}

/**
 * Get the primary image URL with fallback
 */
export function getPrimaryImageUrl(
	images: string[] | any,
	options: ImageOptions = {}
): string {
	const imageArray = parseProductImages(images);
	const primaryUrl = imageArray.length > 0 ? imageArray[0] : '/placeholder-product.jpg';
	
	// Apply optimizations if it's a Supabase URL
	if (primaryUrl.includes('supabase') && Object.keys(options).length > 0) {
		return getOptimizedImageUrl(primaryUrl, options);
	}
	
	return primaryUrl;
}

/**
 * Bulk upload multiple images for a product
 */
export async function uploadMultipleProductImages(
	files: File[],
	productSku: string
): Promise<{ success: string[]; failed: { file: string; error: string }[] }> {
	const results = {
		success: [] as string[],
		failed: [] as { file: string; error: string }[]
	};

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const result = await uploadProductImage(file, productSku, i);
		
		if (result.success && result.url) {
			results.success.push(result.url);
		} else {
			results.failed.push({
				file: file.name,
				error: result.error || 'Unknown error'
			});
		}
	}

	return results;
}

/**
 * Generate srcset for responsive images
 */
export function generateImageSrcSet(originalUrl: string): string {
	const sizes = [300, 600, 900, 1200];
	return sizes
		.map(width => `${getOptimizedImageUrl(originalUrl, { width })} ${width}w`)
		.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateImageSizes(): string {
	return [
		'(max-width: 640px) 100vw',
		'(max-width: 768px) 50vw',
		'(max-width: 1024px) 33vw',
		'25vw'
	].join(', ');
} 

/**
 * Download an image from a URL and upload it to Supabase Storage
 * Used for saving AI-generated images to permanent storage
 */
export async function downloadAndUploadImage(
	imageUrl: string,
	bucketName: string,
	folderPath: string,
	fileName: string
): Promise<ImageUploadResult> {
	try {
		// Download the image from the URL
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
		}

		// Get the image data as a buffer
		const imageBuffer = await response.arrayBuffer();
		const imageFile = new Uint8Array(imageBuffer);

		// Determine content type from response headers or filename
		const contentType = response.headers.get('content-type') || 'image/png';
		
		// Generate the file path
		const filePath = `${folderPath}/${fileName}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from(bucketName)
			.upload(filePath, imageFile, {
				cacheControl: '31536000', // 1 year cache
				upsert: false,
				contentType: contentType
			});

		if (error) {
			console.error('Storage upload error:', error);
			return { success: false, error: error.message };
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from(bucketName)
			.getPublicUrl(filePath);

		return {
			success: true,
			url: urlData.publicUrl,
			path: filePath
		};
	} catch (error) {
		console.error('Download and upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Download and upload failed'
		};
	}
} 