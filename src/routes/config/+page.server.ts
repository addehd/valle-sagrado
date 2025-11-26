import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth');
	}

	// Fetch all map configuration entries
	const { data: mapConfigs, error } = await supabase
		.from('map_config')
		.select('*')
		.order('name');

	if (error) {
		console.error('Error loading map configurations:', error);
		return {
			mapConfigs: [],
			error: 'Failed to load map configurations'
		};
	}

	return {
		mapConfigs: mapConfigs || [],
		user: session.user
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const map_start_latitude = formData.get('map_start_latitude') as string;
		const map_start_longitude = formData.get('map_start_longitude') as string;
		const map_zoom_level = formData.get('map_zoom_level') as string;
		const description = formData.get('description') as string;

		if (!name || !map_start_latitude || !map_start_longitude || !map_zoom_level) {
			return fail(400, { message: 'Name, latitude, longitude, and zoom level are required' });
		}

		// Validate numeric values
		const lat = parseFloat(map_start_latitude);
		const lng = parseFloat(map_start_longitude);
		const zoom = parseInt(map_zoom_level);

		if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
			return fail(400, { message: 'Invalid numeric values for coordinates or zoom level' });
		}

		if (lat < -90 || lat > 90) {
			return fail(400, { message: 'Latitude must be between -90 and 90' });
		}

		if (lng < -180 || lng > 180) {
			return fail(400, { message: 'Longitude must be between -180 and 180' });
		}

		if (zoom < 1 || zoom > 20) {
			return fail(400, { message: 'Zoom level must be between 1 and 20' });
		}

		const { error } = await supabase
			.from('map_config')
			.insert({
				name: name.trim(),
				map_start_latitude: lat,
				map_start_longitude: lng,
				map_zoom_level: zoom,
				description: description?.trim() || null
			});

		if (error) {
			console.error('Error creating map configuration:', error);
			if (error.code === '23505') { // Unique constraint violation
				return fail(400, { message: 'Map configuration name already exists' });
			}
			return fail(500, { message: 'Failed to create map configuration' });
		}

		return { success: true, message: 'Map configuration created successfully' };
	},

	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const map_start_latitude = formData.get('map_start_latitude') as string;
		const map_start_longitude = formData.get('map_start_longitude') as string;
		const map_zoom_level = formData.get('map_zoom_level') as string;
		const description = formData.get('description') as string;
		const is_active = formData.get('is_active') === 'on';

		if (!id || !name || !map_start_latitude || !map_start_longitude || !map_zoom_level) {
			return fail(400, { message: 'All required fields must be provided' });
		}

		// Validate numeric values
		const lat = parseFloat(map_start_latitude);
		const lng = parseFloat(map_start_longitude);
		const zoom = parseInt(map_zoom_level);

		if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
			return fail(400, { message: 'Invalid numeric values for coordinates or zoom level' });
		}

		if (lat < -90 || lat > 90) {
			return fail(400, { message: 'Latitude must be between -90 and 90' });
		}

		if (lng < -180 || lng > 180) {
			return fail(400, { message: 'Longitude must be between -180 and 180' });
		}

		if (zoom < 1 || zoom > 20) {
			return fail(400, { message: 'Zoom level must be between 1 and 20' });
		}

		const { error } = await supabase
			.from('map_config')
			.update({
				name: name.trim(),
				map_start_latitude: lat,
				map_start_longitude: lng,
				map_zoom_level: zoom,
				description: description?.trim() || null,
				is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', parseInt(id));

		if (error) {
			console.error('Error updating map configuration:', error);
			if (error.code === '23505') { // Unique constraint violation
				return fail(400, { message: 'Map configuration name already exists' });
			}
			return fail(500, { message: 'Failed to update map configuration' });
		}

		return { success: true, message: 'Map configuration updated successfully' };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		const { error } = await supabase
			.from('map_config')
			.delete()
			.eq('id', parseInt(id));

		if (error) {
			console.error('Error deleting map configuration:', error);
			return fail(500, { message: 'Failed to delete map configuration' });
		}

		return { success: true, message: 'Map configuration deleted successfully' };
	},

	toggle_active: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const is_active = formData.get('is_active') === 'true';

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		const { error } = await supabase
			.from('map_config')
			.update({
				is_active: !is_active,
				updated_at: new Date().toISOString()
			})
			.eq('id', parseInt(id));

		if (error) {
			console.error('Error toggling map configuration status:', error);
			return fail(500, { message: 'Failed to update map configuration status' });
		}

		return { success: true, message: `Map configuration ${!is_active ? 'activated' : 'deactivated'} successfully` };
	}
}; 