import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const INSTAGRAM_FIELDS =
	'id,caption,media_url,permalink,thumbnail_url,media_type,timestamp';

export const load: PageServerLoad = async ({ fetch }) => {
	if (!env.INSTAGRAM_ACCESS_TOKEN) {
		return {
			instagramPosts: []
		};
	}

	try {
		const response = await fetch(
			`https://graph.instagram.com/me/media?fields=${INSTAGRAM_FIELDS}&access_token=${env.INSTAGRAM_ACCESS_TOKEN}&limit=6`
		);

		if (!response.ok) {
			console.error(
				'Failed to fetch Instagram posts for tryckbart:',
				await response.text()
			);
			return {
				instagramPosts: []
			};
		}

		const data = await response.json();
		const posts = Array.isArray(data?.data) ? data.data : [];

		return {
			instagramPosts: posts
		};
	} catch (error) {
		console.error('Error fetching Instagram posts for tryckbart', error);
		return {
			instagramPosts: []
		};
	}
};
