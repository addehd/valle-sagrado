import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/admin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, user, safeGetSession } }) => {
	try {
		// Get the current session and user
		const { session, user: sessionUser } = await safeGetSession();
		const currentUser = user || sessionUser;
		
		// Require admin authentication
		if (!currentUser) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}
		
		requireAdmin(currentUser);

		const { slug, title, content, meta_description, is_published } = await request.json();

		// Get the user's project
		const { data: adminProjects, error: adminError } = await supabase.rpc('get_user_projects', {
			user_id_param: currentUser.id
		});

		if (adminError || !adminProjects || adminProjects.length === 0) {
			console.error('Error fetching user projects:', adminError);
			return json({ error: 'No project associated with your account' }, { status: 500 });
		}

		const userProject = adminProjects[0];

		// Insert the coaching page
		const { data: coachPage, error: insertError } = await supabase
			.from('coach_pages')
			.insert({
				project_id: userProject.id,
				slug,
				title,
				content,
				meta_description,
				is_published: is_published ?? true
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error inserting coaching page:', insertError);
			return json({ error: 'Failed to create coaching page', details: insertError }, { status: 500 });
		}

		return json({ 
			success: true, 
			page: coachPage,
			message: 'Coaching page created successfully'
		});

	} catch (error) {
		console.error('Admin coaching pages API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};


