import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals: { supabase }, parent }) => {
  // Get parent data (session, brand, user)
  const parentData = await parent();

  const { data: project, error: projectError } = await supabase
    .from('projects_info')
    .select('*')
    .eq('url', params.project)
    .single()

  if (projectError) {
    throw error(404, 'Project not found');
  }

  return {
    ...parentData,
    project
  };
}; 