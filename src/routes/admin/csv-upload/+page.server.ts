import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/admin';

export const load: PageServerLoad = async ({ locals: { supabase, user, safeGetSession } }) => {
	try {
		// Get the current session and user
		const { session, user: sessionUser } = await safeGetSession();
		const currentUser = user || sessionUser;
		
		// Require admin authentication
		if (!currentUser) {
			throw redirect(302, '/auth?redirect=/admin/csv-upload');
		}
		
		requireAdmin(currentUser);

		// Get the user's project(s) through RPC function to bypass RLS restrictions
		const { data: adminProjects, error: adminError } = await supabase.rpc('get_user_projects', {
			user_id_param: currentUser.id
		});

		if (adminError) {
			console.error('Error fetching user projects:', adminError);
			return {
				project: null,
				error: 'Failed to fetch user projects'
			};
		}

		if (!adminProjects || adminProjects.length === 0) {
			return {
				project: null,
				message: 'No project associated with your account. Please contact an administrator to assign you to a project.'
			};
		}

		// For now, use the first project the user is admin of
		const userProject = adminProjects[0];
		const project = {
			id: userProject.id,
			name: userProject.name,
			url: userProject.url
		};

		return { project };

	} catch (error) {
		console.error('CSV upload page error:', error);
		return {
			project: null,
			error: 'Internal server error'
		};
	}
};

export const actions: Actions = {
	upload: async ({ request, locals: { supabase, user, safeGetSession } }) => {
		try {
			// Get the current session and user
			const { session, user: sessionUser } = await safeGetSession();
			const currentUser = user || sessionUser;
			
			if (!currentUser) {
				return fail(401, { error: 'Authentication required' });
			}
			
			requireAdmin(currentUser);

			const formData = await request.formData();
			const csvFile = formData.get('csvFile') as File;

			if (!csvFile || csvFile.size === 0) {
				return fail(400, { error: 'Please select a CSV file to upload' });
			}

			// Check file size (10MB limit)
			if (csvFile.size > 10 * 1024 * 1024) {
				return fail(400, { error: 'File size exceeds 10MB limit' });
			}

			// Check file type
			if (!csvFile.name.toLowerCase().endsWith('.csv')) {
				return fail(400, { error: 'Please upload a valid CSV file' });
			}

			// Get user's project
			const { data: adminProjects, error: adminError } = await supabase.rpc('get_user_projects', {
				user_id_param: currentUser.id
			});

			if (adminError || !adminProjects || adminProjects.length === 0) {
				return fail(403, { error: 'No project associated with your account' });
			}

			const userProject = adminProjects[0];
			const projectId = userProject.id;

			// Parse CSV content
			const csvText = await csvFile.text();
			const results = await parseCSVAndCreateProducts(csvText, projectId, currentUser.id, supabase);

			return {
				success: true,
				message: `CSV upload completed! ${results.successful} products created successfully.`,
				results
			};

		} catch (error) {
			console.error('CSV upload error:', error);
			return fail(500, { error: 'Failed to process CSV upload' });
		}
	}
};

// CSV parsing and product creation function
async function parseCSVAndCreateProducts(csvText: string, projectId: string, userId: string, supabase: any) {
	const lines = csvText.trim().split('\n');
	if (lines.length < 2) {
		throw new Error('CSV file must contain at least a header row and one data row');
	}

	// Parse header
	const headers = parseCSVLine(lines[0]);
	
	// Required columns mapping
	const requiredColumns = {
		handle: findColumnIndex(headers, ['Handle', 'handle']),
		title: findColumnIndex(headers, ['Title', 'title']),
		vendor: findColumnIndex(headers, ['Vendor', 'vendor']),
		published: findColumnIndex(headers, ['Published', 'published']),
		variantSKU: findColumnIndex(headers, ['Variant SKU', 'variant_sku', 'sku']),
		variantPrice: findColumnIndex(headers, ['Variant Price', 'variant_price', 'price']),
		variantInventoryQty: findColumnIndex(headers, ['Variant Inventory Qty', 'variant_inventory_qty', 'stock_quantity', 'stock']),
		variantGrams: findColumnIndex(headers, ['Variant Grams', 'variant_grams', 'weight_grams'])
	};

	// Optional columns mapping
	const optionalColumns = {
		body: findColumnIndex(headers, ['Body (HTML)', 'Body', 'body', 'description']),
		type: findColumnIndex(headers, ['Type', 'type']),
		tags: findColumnIndex(headers, ['Tags', 'tags']),
		variantCompareAtPrice: findColumnIndex(headers, ['Variant Compare At Price', 'compare_at_price']),
		variantBarcode: findColumnIndex(headers, ['Variant Barcode', 'barcode']),
		imageSrc: findColumnIndex(headers, ['Image Src', 'image_src', 'image_url']),
		costPerItem: findColumnIndex(headers, ['Cost per item', 'cost_price', 'cost']),
		variantRequiresShipping: findColumnIndex(headers, ['Variant Requires Shipping', 'requires_shipping']),
		variantTaxable: findColumnIndex(headers, ['Variant Taxable', 'taxable']),
		variantWeightUnit: findColumnIndex(headers, ['Variant Weight Unit', 'weight_unit'])
	};

	// Check for required columns
	const missingColumns = Object.entries(requiredColumns)
		.filter(([_, index]) => index === -1)
		.map(([key, _]) => key);

	if (missingColumns.length > 0) {
		throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
	}

	const results = {
		total: 0,
		successful: 0,
		failed: 0,
		errors: [] as string[]
	};

	// Process each data row
	for (let i = 1; i < lines.length; i++) {
		results.total++;
		
		try {
			const row = parseCSVLine(lines[i]);
			
			if (row.length === 0) continue; // Skip empty rows

			// Extract required data
			const handle = row[requiredColumns.handle]?.trim();
			const title = row[requiredColumns.title]?.trim();
			const vendor = row[requiredColumns.vendor]?.trim();
			const published = parseBoolean(row[requiredColumns.published]);
			const variantSKU = row[requiredColumns.variantSKU]?.trim();
			const variantPrice = parseFloat(row[requiredColumns.variantPrice] || '0');
			const stockQuantity = parseInt(row[requiredColumns.variantInventoryQty] || '0');
			const weightGrams = parseInt(row[requiredColumns.variantGrams] || '0');

			// Validate required fields
			if (!handle || !title || !variantSKU) {
				results.errors.push(`Row ${i + 1}: Missing required fields (handle, title, or SKU)`);
				results.failed++;
				continue;
			}

			if (variantPrice <= 0) {
				results.errors.push(`Row ${i + 1}: Invalid price for ${title}`);
				results.failed++;
				continue;
			}

			// Extract optional data
			const description = row[optionalColumns.body] || '';
			const type = row[optionalColumns.type] || '';
			const tagsString = row[optionalColumns.tags] || '';
			const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
			const compareAtPrice = parseFloat(row[optionalColumns.variantCompareAtPrice] || '0') || null;
			const barcode = row[optionalColumns.variantBarcode] || null;
			const imageUrl = row[optionalColumns.imageSrc] || null;
			const costPrice = parseFloat(row[optionalColumns.costPerItem] || '0') || null;
			const requiresShipping = parseBoolean(row[optionalColumns.variantRequiresShipping], true);
			const taxable = parseBoolean(row[optionalColumns.variantTaxable], true);

			// Generate slug from handle
			const slug = handle
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();

			// Check for duplicate SKU
			const { data: existingProduct } = await supabase
				.from('products')
				.select('sku')
				.eq('sku', variantSKU)
				.eq('project_id', projectId)
				.single();

			if (existingProduct) {
				results.errors.push(`Row ${i + 1}: SKU ${variantSKU} already exists`);
				results.failed++;
				continue;
			}

			// Prepare product data for insertion
			const productData = {
				sku: variantSKU,
				name: title,
				slug,
				brand: vendor,
				description: description || null,
				price: variantPrice,
				compare_at_price: compareAtPrice,
				cost_price: costPrice,
				currency: 'USD', // Default currency
				stock: stockQuantity,
				track_inventory: true,
				allow_backorders: false,
				weight_grams: weightGrams || null,
				images: imageUrl ? [imageUrl] : [],
				attributes: {
					tags: tags,
					type: type,
					barcode: barcode,
					requires_shipping: requiresShipping,
					taxable: taxable
				},
				status: published ? 'active' : 'draft',
				is_active: published,
				is_featured: false,
				requires_shipping: requiresShipping,
				project_id: projectId,
				created_by: userId
			};

			// Insert product into database
			const { error: insertError } = await supabase
				.from('products')
				.insert(productData);

			if (insertError) {
				console.error('Product insert error:', insertError);
				results.errors.push(`Row ${i + 1}: Failed to create product ${title} - ${insertError.message}`);
				results.failed++;
			} else {
				results.successful++;
			}

		} catch (rowError) {
			console.error('Row processing error:', rowError);
			results.errors.push(`Row ${i + 1}: ${rowError.message}`);
			results.failed++;
		}
	}

	return results;
}

// Helper functions
function parseCSVLine(line: string): string[] {
	const result = [];
	let current = '';
	let inQuotes = false;
	
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		
		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	
	result.push(current);
	return result;
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
	for (const name of possibleNames) {
		const index = headers.findIndex(header => 
			header.toLowerCase().trim() === name.toLowerCase()
		);
		if (index !== -1) return index;
	}
	return -1;
}

function parseBoolean(value: string, defaultValue: boolean = false): boolean {
	if (!value) return defaultValue;
	const normalized = value.toLowerCase().trim();
	return normalized === 'true' || normalized === '1' || normalized === 'yes';
} 