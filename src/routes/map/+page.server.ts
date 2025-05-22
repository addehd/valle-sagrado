import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: teachers, error } = await supabase
    .from('projects_info')
    .select('*');


  if (error) {
    console.error('Error loading teachers:', error);
    return {
      teachers: []
    };
  }

  // optional: fetch ratings if needed
  const { data: ratings, error: ratingsError } = await supabase
    .from('teacher_ratings')
    .select('*');

  if (ratingsError) {
    console.error('Error loading ratings:', ratingsError);
    return {
      teachers,
      ratings: []
    };
  }

  return {
    teachers,
    ratings
  };
};