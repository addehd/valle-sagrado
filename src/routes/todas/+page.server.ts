import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
    const searchTerm = url.searchParams.get('q') || '';
    const searchField = url.searchParams.get('field') || 'ruc';
    const limit = 50;

    let query = supabase
        .from('padron_ruc')
        .select('*')
        .limit(limit);

    if (searchTerm) {
        switch (searchField) {
            case 'ruc':
                query = query.ilike('ruc', `%${searchTerm}%`);
                break;
            case 'departamento':
                query = query.ilike('departamento', `%${searchTerm}%`);
                break;
            case 'distrito':
                query = query.ilike('distrito', `%${searchTerm}%`);
                break;
            case 'ubigeo':
                query = query.ilike('ubigeo', `%${searchTerm}%`);
                break;
            default:
                query = query.ilike('ruc', `%${searchTerm}%`);
        }
    }

    const { data: results, error } = await query;

    if (error) {
        console.error('Error fetching padron_ruc:', error);
        return fail(500, { message: 'Error fetching data' });
    }

    return { 
        results,
        searchTerm,
        searchField
    };
};
