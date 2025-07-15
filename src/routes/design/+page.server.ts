import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { downloadAndUploadImage } from '$lib/image';

// Server-side cache for generated designs
interface ServerCacheEntry {
	design: any;
	timestamp: number;
}

const serverCache = new Map<string, ServerCacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour server-side cache
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

// Storage configuration for custom designs
const DESIGN_STORAGE_BUCKET = 'teacher'; // Using existing bucket for now
const DESIGN_STORAGE_FOLDER = 'custom-designs';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

// Function to get OpenAI client with lazy initialization
function getOpenAIClient() {
	return new OpenAI({
		apiKey: OPENAI_API_KEY
	});
}

// Cache utility functions
function generateServerCacheKey(prompt: string, option: string, colors: number): string {
	const baseKey = option || prompt.toLowerCase().trim();
	return `${baseKey}_${colors}`;
}

function getServerCachedDesign(cacheKey: string): any | null {
	const cached = serverCache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.design;
	}
	
	// Clean up expired cache
	if (cached) {
		serverCache.delete(cacheKey);
	}
	
	return null;
}

function setServerCachedDesign(cacheKey: string, design: any): void {
	serverCache.set(cacheKey, {
		design,
		timestamp: Date.now()
	});
	
	// Periodic cleanup - remove old entries
	if (serverCache.size > 100) {
		const now = Date.now();
		for (const [key, entry] of serverCache.entries()) {
			if (now - entry.timestamp > CACHE_DURATION) {
				serverCache.delete(key);
			}
		}
	}
}

// Rate limiting function
function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const key = ip;
	
	const record = rateLimitMap.get(key);
	
	if (!record) {
		rateLimitMap.set(key, { count: 1, windowStart: now });
		return true;
	}
	
	// Reset window if it's been more than RATE_LIMIT_WINDOW
	if (now - record.windowStart > RATE_LIMIT_WINDOW) {
		rateLimitMap.set(key, { count: 1, windowStart: now });
		return true;
	}
	
	// Check if within rate limit
	if (record.count < RATE_LIMIT_MAX_REQUESTS) {
		record.count++;
		return true;
	}
	
	return false;
}

// Cleanup old rate limit entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, record] of rateLimitMap.entries()) {
		if (now - record.windowStart > RATE_LIMIT_WINDOW) {
			rateLimitMap.delete(key);
		}
	}
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Add the load function to fetch saved designs
export const load: PageServerLoad = async ({ url, locals }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const pageSize = parseInt(url.searchParams.get('pageSize') || '12');
		const userId = locals.user?.id;
		
		// Calculate pagination
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;
		
		// Build query to fetch designs
		let query = locals.supabase
			.from('custom_design')
			.select('*', { count: 'exact' });
		
		// Add user filter if authenticated
		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			// For anonymous users, show public designs or none
			query = query.is('user_id', null);
		}
		
		// Execute query with pagination
		const { data, error, count } = await query
			.order('created_at', { ascending: false })
			.range(from, to);
		
		if (error) {
			console.error('Error fetching designs:', error);
			throw error;
		}
		
		return {
			designs: data || [],
			totalCount: count || 0,
			page,
			pageSize,
			totalPages: Math.ceil((count || 0) / pageSize)
		};
	} catch (error) {
		console.error('Error in load function:', error);
		// Return empty state instead of throwing to prevent page crash
		return {
			designs: [],
			totalCount: 0,
			page: 1,
			pageSize: 12,
			totalPages: 0
		};
	}
};

export const actions: Actions = {
	generateDesign: async ({ request, getClientAddress, locals }) => {
		const clientIP = getClientAddress();
		
		// Check rate limit
		if (!checkRateLimit(clientIP)) {
			console.log(`Rate limit exceeded for IP: ${clientIP}`);
			return fail(429, { error: 'Too many requests. Please wait a moment and try again.' });
		}

		const data = await request.formData();
		const customPrompt = data.get('customPrompt') as string;
		const predefinedOption = data.get('predefinedOption') as string;
		const colorCount = parseInt(data.get('colorCount') as string) || 1;

		// Validate input
		if (!customPrompt && !predefinedOption) {
			return fail(400, { error: 'Please provide a custom prompt or select a predefined option' });
		}

		// Build the AI prompt
		let finalPrompt = '';
		
		if (predefinedOption) {
			const predefinedPrompts = {
				'red-flowers': 'Create a red logo with beautiful flowers',
				'minimalist-icon': 'Design a clean, minimalist icon',
				'vintage-badge': 'Create a vintage-style badge design',
				'geometric-pattern': 'Design a modern geometric pattern',
				'nature-inspired': 'Create a nature-inspired organic design'
			};
			
			finalPrompt = predefinedPrompts[predefinedOption as keyof typeof predefinedPrompts] || predefinedOption;
		} else {
			finalPrompt = customPrompt;
		}

		// Check server cache first
		const serverCacheKey = generateServerCacheKey(customPrompt, predefinedOption, colorCount);
		const cachedDesign = getServerCachedDesign(serverCacheKey);
		
		if (cachedDesign) {
			console.log('🔄 Using server-cached design:', serverCacheKey);
			console.log('⚠️ CACHED DESIGN - Auto-save may have already occurred for this design');
			return {
				success: true,
				design: cachedDesign
			};
		}

		// Enhanced prompt template for t-shirt design
		const aiPrompt = `Create a t-shirt design: ${finalPrompt}

Design specifications:
- Use maximum ${colorCount} color${colorCount > 1 ? 's' : ''} 
- Simple, bold, and high-contrast design
- Suitable for screen printing or vinyl cutting
- Clean vector-style artwork
- No text overlays or complex backgrounds
- Focus on the main graphic element
- Centered composition that works well on fabric

Style: Modern, professional, suitable for apparel printing`;

		console.log('AI Prompt:', aiPrompt);
		console.log('Client IP:', clientIP);

		try {
			// Check if OpenAI API key is available
			if (!OPENAI_API_KEY) {
				console.error('OpenAI API key not configured');
				return fail(500, { error: 'AI service not configured. Please check server configuration.' });
			}

			const openai = getOpenAIClient();

			// Generate image using DALL-E 3 with high quality
			const response = await openai.images.generate({
				model: "dall-e-3",
				prompt: aiPrompt,
				n: 1,
				size: "1024x1024",
				quality: "hd",
				style: "vivid"
			});

			console.log('DALL-E 3 response received');
			console.log('DALL-E 3 response:', JSON.stringify(response, null, 2));

			if (!response.data || response.data.length === 0) {
				throw new Error('No image generated by AI service');
			}

			const generatedImage = response.data[0];
			
			if (!generatedImage.url) {
				throw new Error('No image URL returned from AI service');
			}

			// Download the image from OpenAI and upload to Supabase Storage
			console.log('🔄 Downloading image from OpenAI and uploading to Supabase Storage...');
			const timestamp = Date.now();
			const fileName = `design-${timestamp}-${Math.random().toString(36).slice(2)}.png`;
			
			const uploadResult = await downloadAndUploadImage(
				generatedImage.url,
				DESIGN_STORAGE_BUCKET,
				DESIGN_STORAGE_FOLDER,
				fileName
			);

			if (!uploadResult.success || !uploadResult.url) {
				console.error('❌ Failed to upload image to Supabase Storage:', uploadResult.error);
				throw new Error(`Failed to save image to storage: ${uploadResult.error || 'No URL returned'}`);
			}

			console.log('✅ Image uploaded successfully to Supabase Storage:', uploadResult.url);

			// Create design object with AI-generated data using permanent storage URL
			const design: {
				imageUrl: string;
				prompt: string;
				aiPrompt: string;
				colorCount: number;
				style: string;
				timestamp: string;
				revisedPrompt: string | null;
				id?: string;
			} = {
				imageUrl: uploadResult.url, // Use permanent Supabase Storage URL
				prompt: finalPrompt,
				aiPrompt: aiPrompt,
				colorCount: colorCount,
				style: predefinedOption || 'custom',
				timestamp: new Date().toISOString(),
				revisedPrompt: generatedImage.revised_prompt || null
			};

			// Cache the design on the server
			setServerCachedDesign(serverCacheKey, design);

			// Auto-save the design to database
			try {
				console.log('🔄 Auto-saving generated design to database...');
				console.log('🔍 Debug - User ID:', locals.user?.id);
				console.log('🔍 Debug - User object:', locals.user);
				console.log('🔍 Debug - Image URL length:', design.imageUrl.length);
				console.log('🔍 Debug - Prompt:', design.prompt);
				console.log('🔍 Debug - Supabase client available:', !!locals.supabase);
				
				// Check current auth state
				const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
				console.log('🔍 Debug - Auth user from getUser():', user);
				console.log('🔍 Debug - Auth error:', authError);
				
				const insertData = {
					user_id: locals.user?.id || null,
					image_url: design.imageUrl,
					prompt: design.prompt,
					metadata: {
						model: 'dall-e-3',
						colorCount: design.colorCount,
						style: design.style,
						aiPrompt: design.aiPrompt,
						revisedPrompt: design.revisedPrompt
					}
				};
				
				console.log('🔍 Debug - Insert data:', JSON.stringify(insertData, null, 2));
				
				const { data: savedDesign, error: saveError } = await locals.supabase
					.from('custom_design')
					.insert(insertData)
					.select()
					.single();

				if (saveError) {
					console.error('❌ Error auto-saving design:', saveError);
					console.error('❌ Error details:', JSON.stringify(saveError, null, 2));
					// Don't fail the generation if save fails, just log it
				} else {
					console.log('✅ Design auto-saved successfully:', savedDesign);
					// Add the database ID to the design object
					design.id = savedDesign.id;
				}
			} catch (autoSaveError) {
				console.error('❌ Auto-save failed:', autoSaveError);
				if (autoSaveError instanceof Error) {
					console.error('❌ Auto-save error stack:', autoSaveError.stack);
				}
				// Don't fail the generation if save fails
			}

			console.log('Generated design:', JSON.stringify(design, null, 2));
			console.log('Design generated and cached successfully');

			return {
				success: true,
				design: design
			};

		} catch (error) {
			console.error('Design generation error:', error);
			
			// Handle specific OpenAI errors
			if (error instanceof Error) {
				// Check for specific OpenAI error patterns
				if (error.message.includes('billing') || error.message.includes('quota')) {
					return fail(503, { error: 'AI service temporarily unavailable. Please try again later.' });
				}
				
				if (error.message.includes('content_policy')) {
					return fail(400, { error: 'Design prompt violates content policy. Please modify your request.' });
				}
				
				if (error.message.includes('rate_limit')) {
					return fail(429, { error: 'AI service rate limit exceeded. Please wait a moment and try again.' });
				}
			}

			// Generic error fallback
			return fail(500, { error: 'Failed to generate design. Please try again.' });
		}
	},
	
	saveDesign: async ({ request, locals }) => {
		console.log('🎨 saveDesign action called');
		const formData = await request.formData();
		const imageUrl = formData.get('imageUrl')?.toString();
		const prompt = formData.get('prompt')?.toString();
		const metadataStr = formData.get('metadata')?.toString();
		const userId = locals.user?.id;
		
		console.log('Form data received:', { 
			imageUrl: imageUrl?.substring(0, 50) + '...', 
			prompt: prompt?.substring(0, 50) + '...', 
			userId,
			hasMetadata: !!metadataStr 
		});
		
		// Validate required fields
		if (!imageUrl || !prompt) {
			console.log('❌ Validation failed: missing required fields');
			return fail(400, { 
				error: 'Missing required fields: image URL and prompt are required',
				values: { imageUrl, prompt }
			});
		}
		
		try {
			// Parse metadata if provided
			let metadata = {};
			if (metadataStr) {
				try {
					metadata = JSON.parse(metadataStr);
					console.log('✅ Metadata parsed successfully');
				} catch (e) {
					console.error('Error parsing metadata:', e);
					metadata = {};
				}
			}
			
			console.log('🔄 Attempting to insert into Supabase...');
			// Insert into Supabase
			const { data, error } = await locals.supabase
				.from('custom_design')
				.insert({
					user_id: userId || null,
					image_url: imageUrl,
					prompt,
					metadata
				})
				.select()
				.single();
			
			if (error) {
				console.error('❌ Error saving design to database:', error);
				throw error;
			}
			
			console.log('✅ Design saved successfully:', data);
			return { 
				success: true, 
				design: data,
				message: 'Design saved successfully!'
			};
		} catch (error) {
			console.error('❌ Error saving design:', error);
			return fail(500, { 
				error: 'Failed to save design. Please try again.',
				values: { imageUrl, prompt }
			});
		}
	}
}; 