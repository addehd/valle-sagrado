import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	// get teacher_id from the URL query parameter
	const teacherId = url.searchParams.get('teacher_id');
	
	if (!teacherId) {
		return { 
			teachers: null,
			selectedTeacher: null 
		};
	}

	// fetch teachers for dropdown selection
	const { data: teachers } = await supabase
		.from('teachers')
		.select('*');

	// fetch the specific teacher if ID is provided
	const { data: selectedTeacher } = await supabase
		.from('teachers')
		.select('*')
		.eq('id', teacherId)
		.single();

	return { 
		teachers,
		selectedTeacher
	};
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const teacher_id = Number(formData.get('teacher_id'));
		const stars = Number(formData.get('stars'));
		const text = formData.get('text')?.toString() || null;
		const reviewer_name = formData.get('reviewer_name')?.toString() || null;
		const reviewer_avatar = formData.get('reviewer_avatar')?.toString() || null;

		// basic validation
		if (isNaN(teacher_id) || teacher_id <= 0) {
			return fail(400, { field: 'teacher_id', error: 'invalid teacher id provided.' });
		}

		if (isNaN(stars) || stars < 1 || stars > 5) {
			return fail(400, { field: 'stars', error: 'rating must be between 1 and 5.' });
		}

		try {
			// insert the rating using supabase
			const { data, error } = await supabase
				.from('teacher_ratings')
				.insert({
					teacher_id,
					stars,
					text,
					reviewer_name,
					reviewer_avatar
				})
				.select('id')
				.single();

			if (error) throw error;

			// return success state with the new rating id
			return { success: true, ratingId: data.id };
		} catch (error) {
			console.error('failed to insert rating:', error);
			// return a generic error message
			return fail(500, { error: 'failed to submit rating. please try again.' });
		}
	}
};
