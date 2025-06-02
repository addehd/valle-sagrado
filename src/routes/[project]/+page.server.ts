import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {

  const { data: project, error: projectError } = await supabase
    .from('projects_info')
    .select('*')
    .eq('url', params.project)
    .single()

  if (projectError) {
    throw error(404, 'Project not found');
  }

  // Get products for this project
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  return {
    project,
    products: products || []
  };
};
