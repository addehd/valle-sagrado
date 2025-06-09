import type { SupabaseClient } from '@supabase/supabase-js';
import type { Receipt, ReceiptStats, ReceiptUploadResponse, ReceiptProcessedData } from './types';

/**
 * Create a new receipt record in the database
 */
export async function createReceipt(
	supabase: SupabaseClient,
	receiptData: Partial<Receipt>
): Promise<ReceiptUploadResponse> {
	try {
		const { data, error } = await supabase
			.from('receipts')
			.insert([receiptData])
			.select()
			.single();

		if (error) {
			console.error('Error creating receipt:', error);
			return {
				success: false,
				error: 'Failed to create receipt',
				details: error.message
			};
		}

		return {
			success: true,
			receipt_id: data.id
		};
	} catch (error) {
		console.error('Unexpected error creating receipt:', error);
		return {
			success: false,
			error: 'Unexpected error occurred',
			details: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Update a receipt with processing results
 */
export async function updateReceipt(
	supabase: SupabaseClient,
	receiptId: string,
	updates: Partial<Receipt>
): Promise<ReceiptUploadResponse> {
	try {
		const { data, error } = await supabase
			.from('receipts')
			.update(updates)
			.eq('id', receiptId)
			.select()
			.single();

		if (error) {
			console.error('Error updating receipt:', error);
			return {
				success: false,
				error: 'Failed to update receipt',
				details: error.message
			};
		}

		return {
			success: true,
			receipt_id: data.id
		};
	} catch (error) {
		console.error('Unexpected error updating receipt:', error);
		return {
			success: false,
			error: 'Unexpected error occurred',
			details: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Get all receipts for a user
 */
export async function getUserReceipts(
	supabase: SupabaseClient,
	userId?: string,
	limit = 50,
	offset = 0
): Promise<{ receipts: Receipt[]; error?: string }> {
	try {
		let query = supabase
			.from('receipts')
			.select('*')
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (userId) {
			query = query.eq('user_id', userId);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching receipts:', error);
			return {
				receipts: [],
				error: error.message
			};
		}

		return { receipts: data || [] };
	} catch (error) {
		console.error('Unexpected error fetching receipts:', error);
		return {
			receipts: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Get a specific receipt by ID
 */
export async function getReceiptById(
	supabase: SupabaseClient,
	receiptId: string
): Promise<{ receipt: Receipt | null; error?: string }> {
	try {
		const { data, error } = await supabase
			.from('receipts')
			.select('*')
			.eq('id', receiptId)
			.single();

		if (error) {
			console.error('Error fetching receipt:', error);
			return {
				receipt: null,
				error: error.message
			};
		}

		return { receipt: data };
	} catch (error) {
		console.error('Unexpected error fetching receipt:', error);
		return {
			receipt: null,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Get receipt statistics for a user
 */
export async function getReceiptStats(
	supabase: SupabaseClient,
	userId: string
): Promise<{ stats: ReceiptStats | null; error?: string }> {
	try {
		const { data, error } = await supabase
			.rpc('get_user_receipt_stats', { user_uuid: userId });

		if (error) {
			console.error('Error fetching receipt stats:', error);
			return {
				stats: null,
				error: error.message
			};
		}

		return { stats: data?.[0] || null };
	} catch (error) {
		console.error('Unexpected error fetching receipt stats:', error);
		return {
			stats: null,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(
	supabase: SupabaseClient,
	receiptId: string
): Promise<ReceiptUploadResponse> {
	try {
		const { error } = await supabase
			.from('receipts')
			.delete()
			.eq('id', receiptId);

		if (error) {
			console.error('Error deleting receipt:', error);
			return {
				success: false,
				error: 'Failed to delete receipt',
				details: error.message
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Unexpected error deleting receipt:', error);
		return {
			success: false,
			error: 'Unexpected error occurred',
			details: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Search receipts by merchant or other criteria
 */
export async function searchReceipts(
	supabase: SupabaseClient,
	userId: string,
	searchTerm: string,
	limit = 50
): Promise<{ receipts: Receipt[]; error?: string }> {
	try {
		const { data, error } = await supabase
			.from('receipts')
			.select('*')
			.eq('user_id', userId)
			.or(`merchant.ilike.%${searchTerm}%,raw_text.ilike.%${searchTerm}%`)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) {
			console.error('Error searching receipts:', error);
			return {
				receipts: [],
				error: error.message
			};
		}

		return { receipts: data || [] };
	} catch (error) {
		console.error('Unexpected error searching receipts:', error);
		return {
			receipts: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Get receipts by date range
 */
export async function getReceiptsByDateRange(
	supabase: SupabaseClient,
	userId: string,
	startDate: string,
	endDate: string
): Promise<{ receipts: Receipt[]; error?: string }> {
	try {
		const { data, error } = await supabase
			.from('receipts')
			.select('*')
			.eq('user_id', userId)
			.gte('date', startDate)
			.lte('date', endDate)
			.order('date', { ascending: false });

		if (error) {
			console.error('Error fetching receipts by date range:', error);
			return {
				receipts: [],
				error: error.message
			};
		}

		return { receipts: data || [] };
	} catch (error) {
		console.error('Unexpected error fetching receipts by date range:', error);
		return {
			receipts: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
} 