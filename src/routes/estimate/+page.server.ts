import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { supabase } = locals;

	// Get estimates from database
	const { data: estimates, error: estimatesError } = await supabase
		.from('estimates')
		.select('*')
		.order('created_at', { ascending: false });

	if (estimatesError) {
		console.error('Error fetching estimates:', estimatesError);
		throw error(500, 'Failed to load estimates');
	}

	return {
		estimates: estimates || [],
		user: locals.user
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { supabase, user } = locals;

		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const serviceName = formData.get('service_name') as string;
		const description = formData.get('description') as string;
		const hourlyRate = parseFloat(formData.get('hourly_rate') as string);
		const estimatedHours = parseFloat(formData.get('estimated_hours') as string);
		const notes = formData.get('notes') as string;

		// Validation
		if (!title || !serviceName || !hourlyRate || !estimatedHours) {
			return fail(400, {
				error: 'Title, service name, hourly rate, and estimated hours are required'
			});
		}

		if (hourlyRate <= 0 || estimatedHours <= 0) {
			return fail(400, {
				error: 'Hourly rate and estimated hours must be positive numbers'
			});
		}

		const totalCost = hourlyRate * estimatedHours;

		const { data, error: insertError } = await supabase
			.from('estimates')
			.insert({
				title,
				service_name: serviceName,
				description: description || null,
				hourly_rate: hourlyRate,
				estimated_hours: estimatedHours,
				total_cost: totalCost,
				notes: notes || null,
				status: 'draft',
				is_completed: false,
				created_by: user.id
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creating estimate:', insertError);
			return fail(500, {
				error: 'Failed to create estimate'
			});
		}

		return {
			success: true,
			message: 'Estimate created successfully!',
			estimate: data
		};
	},

	update: async ({ request, locals }) => {
		const { supabase, user } = locals;

		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const title = formData.get('title') as string;
		const serviceName = formData.get('service_name') as string;
		const description = formData.get('description') as string;
		const hourlyRate = parseFloat(formData.get('hourly_rate') as string);
		const estimatedHours = parseFloat(formData.get('estimated_hours') as string);
		const notes = formData.get('notes') as string;
		const status = formData.get('status') as string;
		const isCompleted = formData.has('is_completed');

		// Validation
		if (!id || !title || !serviceName || !hourlyRate || !estimatedHours) {
			return fail(400, {
				error: 'All required fields must be provided'
			});
		}

		if (hourlyRate <= 0 || estimatedHours <= 0) {
			return fail(400, {
				error: 'Hourly rate and estimated hours must be positive numbers'
			});
		}

		const totalCost = hourlyRate * estimatedHours;

		const { data, error: updateError } = await supabase
			.from('estimates')
			.update({
				title,
				service_name: serviceName,
				description: description || null,
				hourly_rate: hourlyRate,
				estimated_hours: estimatedHours,
				total_cost: totalCost,
				notes: notes || null,
				status: status || 'draft',
				is_completed: isCompleted,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.eq('created_by', user.id) // Ensure user can only update their own estimates
			.select()
			.single();

		if (updateError) {
			console.error('Error updating estimate:', updateError);
			return fail(500, {
				error: 'Failed to update estimate'
			});
		}

		if (!data) {
			return fail(404, {
				error: 'Estimate not found or you do not have permission to update it'
			});
		}

		return {
			success: true,
			message: 'Estimate updated successfully!',
			estimate: data
		};
	},

	delete: async ({ request, locals }) => {
		const { supabase, user } = locals;

		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, {
				error: 'Estimate ID is required'
			});
		}

		const { error: deleteError } = await supabase
			.from('estimates')
			.delete()
			.eq('id', id)
			.eq('created_by', user.id); // Ensure user can only delete their own estimates

		if (deleteError) {
			console.error('Error deleting estimate:', deleteError);
			return fail(500, {
				error: 'Failed to delete estimate'
			});
		}

		return {
			success: true,
			message: 'Estimate deleted successfully!'
		};
	}
};