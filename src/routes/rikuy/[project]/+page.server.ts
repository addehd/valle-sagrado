import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
  // Get project data from layout
  const { project } = await parent();

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
    project, // Pass project data to the page
    products: products || []
  };
};
