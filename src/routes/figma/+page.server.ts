import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
  try {
    // Get query parameters for pagination and filtering
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '12'), 50);
    const framework = url.searchParams.get('framework');
    const source = url.searchParams.get('source');
    const offset = (page - 1) * limit;

    // Build query with optional filters
    let query = locals.supabase
      .from('banners')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (framework) {
      query = query.eq('framework', framework);
    }
    if (source) {
      query = query.eq('source', source);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: banners, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching banners:', fetchError);
      throw error(500, 'Failed to load banners');
    }

    // Get unique frameworks and sources for filter options
    const { data: frameworks } = await locals.supabase
      .from('banners')
      .select('framework')
      .eq('is_active', true)
      .order('framework');

    const { data: sources } = await locals.supabase
      .from('banners')
      .select('source')
      .eq('is_active', true)
      .order('source');

    // Extract unique values
    const uniqueFrameworks = [...new Set(frameworks?.map(f => f.framework) || [])];
    const uniqueSources = [...new Set(sources?.map(s => s.source) || [])];

    return {
      banners: banners || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      },
      filters: {
        frameworks: uniqueFrameworks,
        sources: uniqueSources,
        selectedFramework: framework,
        selectedSource: source
      }
    };
  } catch (err) {
    console.error('Error in igma page load:', err);
    throw error(500, 'Failed to load page');
  }
}; 