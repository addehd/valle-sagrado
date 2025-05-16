import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  
  const teacherId = url.searchParams.get('teacher_id');

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', teacherId)

  const { data: ratings, error: reviewsError } = await supabase
    .from('teacher_ratings')
    .select('*')
    .eq('teacher_id', teacherId)

  return { teachers, ratings };
};
