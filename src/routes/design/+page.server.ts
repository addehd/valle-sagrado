import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

// Server-side cache for generated designs
interface ServerCacheEntry {
	design: any;
	timestamp: number;
}

const serverCache = new Map<string, ServerCacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour server-side cache
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

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

export const actions: Actions = {
	generateDesign: async ({ request, getClientAddress }) => {
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
			console.log('Using server-cached design:', serverCacheKey);
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

			// Create design object with AI-generated data
			const design = {
				imageUrl: generatedImage.url,
				prompt: finalPrompt,
				aiPrompt: aiPrompt,
				colorCount: colorCount,
				style: predefinedOption || 'custom',
				timestamp: new Date().toISOString(),
				revisedPrompt: generatedImage.revised_prompt || null
			};

			// Cache the design on the server
			setServerCachedDesign(serverCacheKey, design);

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
	}
}; 