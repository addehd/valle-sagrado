// src/routes/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, session } }) => {
  const { data: brand, error: err } = await supabase
    .from('brand')
    .select('logo_url, colors, name, website_url, description');

  if (err) {
    console.error('Error fetching brands:', err);
    throw error(500, 'Could not load brand data');
  }

  return {
    session,
    brand: brand[0]
  };
};