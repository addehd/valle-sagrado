// src/routes/+layout.server.ts
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession();

  const { data: brand, error: err } = await supabase
    .from('brand')
    .select('logo_url, colors, name, website_url, description');

  if (err) {
    console.error('Error fetching brands:', err);
    throw error(500, 'Could not load brand data');
  }

  const brandData = brand || [];

  return {
    session,
    brand: brandData[0],
    user
  };
};