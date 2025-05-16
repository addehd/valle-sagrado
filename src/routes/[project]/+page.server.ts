import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {

  const { data: project, error } = await supabase
    .from('projects_info')
    .select('*')
    .eq('url', params.project)
    .single()

  console.log("tada", project)

  return { project, tada: "tada" };
};
