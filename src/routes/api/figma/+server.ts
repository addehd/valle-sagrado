import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Type definitions for the Figma export data
interface FigmaExportData {
  html: string;
  framework: string;
  settings: {
    framework: string;
    jsx: boolean;
    inlineStyle: boolean;
    optimizeLayout: boolean;
    layerName: boolean;
    responsiveRoot: boolean;
    flutterGenerationMode: string;
    swiftUIGenerationMode: string;
    roundTailwind: boolean;
    apiEndpoint: string;
  };
  metadata: {
    timestamp: number;
    hasPreview: boolean;
    previewSize: {
      width: number;
      height: number;
    };
  };
}

// GET - Retrieve all processed exports
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Get total count
    const { count, error: countError } = await locals.supabase
      .from('banners')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting banners:', countError);
      throw error(500, 'Failed to count banners');
    }

    // Get paginated exports
    const { data: banners, error: selectError } = await locals.supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (selectError) {
      console.error('Error fetching banners:', selectError);
      throw error(500, 'Failed to fetch banners');
    }

    return json({
      success: true,
      data: {
        exports: banners || [],
        total: count || 0,
        limit,
        offset
      }
    });
  } catch (err) {
    console.error('Error in GET /api/figma:', err);
    return json({
      success: false,
      error: 'Failed to retrieve exports'
    }, { status: 500 });
  }
};

// POST - Process new Figma export data
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const contentType = request.headers.get('content-type');
    let exportData: FigmaExportData;

    // Handle different content types
    if (contentType?.includes('application/json')) {
      exportData = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const exportDataJson = formData.get('exportData') as string;
      if (!exportDataJson) {
        throw error(400, 'Missing exportData field in form data');
      }
      exportData = JSON.parse(exportDataJson);
    } else {
      throw error(400, 'Unsupported content type. Use application/json or application/x-www-form-urlencoded');
    }

    // Validate required fields
    if (!exportData.html || !exportData.framework) {
      throw error(400, 'Missing required fields: html and framework are required');
    }

    if (!exportData.metadata || typeof exportData.metadata.previewSize !== 'object') {
      throw error(400, 'Invalid metadata: previewSize is required');
    }

    if (!exportData.settings || typeof exportData.settings !== 'object') {
      throw error(400, 'Invalid settings object');
    }

    // Sanitize HTML (basic XSS protection)
    const sanitizedHtml = sanitizeHtml(exportData.html);

    // Insert into Supabase
    const { data: insertedBanner, error: insertError } = await locals.supabase
      .from('banners')
      .insert({
        html: sanitizedHtml,
        framework: exportData.framework,
        settings: exportData.settings,
        metadata: exportData.metadata,
        source: 'api'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting banner:', insertError);
      throw error(500, 'Failed to save banner to database');
    }

    // Return success response
    return json({
      success: true,
      data: {
        export: insertedBanner
      },
      message: 'Export processed successfully'
    }, { status: 201 });

  } catch (err) {
    console.error('Error processing Figma export via API:', err);
    
    if (err instanceof Error) {
      return json({
        success: false,
        error: err.message
      }, { status: 400 });
    }

    return json({
      success: false,
      error: 'Failed to process export data'
    }, { status: 500 });
  }
};

// DELETE - Clear all exports
export const DELETE: RequestHandler = async ({ locals }) => {
  try {
    // Get count before deletion
    const { count: totalCount, error: countError } = await locals.supabase
      .from('banners')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting banners for deletion:', countError);
      throw error(500, 'Failed to count banners');
    }

    // Delete all banners
    const { error: deleteError } = await locals.supabase
      .from('banners')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)

    if (deleteError) {
      console.error('Error deleting banners:', deleteError);
      throw error(500, 'Failed to delete banners');
    }

    return json({
      success: true,
      message: `Cleared ${totalCount || 0} exports`,
      data: {
        deletedCount: totalCount || 0
      }
    });
  } catch (err) {
    console.error('Error in DELETE /api/figma:', err);
    return json({
      success: false,
      error: 'Failed to clear exports'
    }, { status: 500 });
  }
};



// Basic HTML sanitization (in production, use a proper library like DOMPurify)
function sanitizeHtml(html: string): string {
  // Remove potentially dangerous tags and attributes
  const dangerousTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const dangerousAttributes = /on\w+\s*=\s*["'][^"']*["']/gi;
  
  return html
    .replace(dangerousTags, '')
    .replace(dangerousAttributes, '')
    .trim();
} 