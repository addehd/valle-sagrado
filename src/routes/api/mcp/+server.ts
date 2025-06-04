import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Create Supabase client for MCP operations
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const handler = createMcpHandler((server) => {
  // Tool to get all projects/teachers
  server.tool(
    'get_projects',
    'Get all projects and teachers from Valle Sagrado',
    {
      limit: z.number().int().min(1).max(100).optional().default(10),
      category: z.string().optional()
    },
    async ({ limit, category }) => {
      try {
        let query = supabase
          .from('projects_info')
          .select('*')
          .limit(limit);

        if (category) {
          query = query.contains('categories', [category]);
        }

        const { data, error } = await query;

        if (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error fetching projects: ${error.message}` 
            }] 
          };
        }

        const projectsList = data?.map(project => 
          `📍 **${project.name}** (${project.country_flag})\n` +
          `   Categories: ${project.categories?.join(', ') || 'None'}\n` +
          `   Tags: ${project.tags?.join(', ') || 'None'}\n` +
          `   URL: /${project.url}\n`
        ).join('\n') || 'No projects found';

        return { 
          content: [{ 
            type: 'text', 
            text: `🌎 **Valle Sagrado Projects** (${data?.length || 0} found)\n\n${projectsList}` 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  // Tool to get project details
  server.tool(
    'get_project_details',
    'Get detailed information about a specific project by URL slug',
    {
      url: z.string().describe('Project URL slug (e.g., "john-smith" for /john-smith)')
    },
    async ({ url }) => {
      try {
        const { data, error } = await supabase
          .from('projects_info')
          .select('*')
          .eq('url', url)
          .single();

        if (error || !data) {
          return { 
            content: [{ 
              type: 'text', 
              text: `❌ Project not found with URL: ${url}` 
            }] 
          };
        }

        const details = `🌟 **${data.name}**\n` +
          `📍 Country: ${data.country_flag}\n` +
          `🏷️ Categories: ${data.categories?.join(', ') || 'None'}\n` +
          `🏷️ Tags: ${data.tags?.join(', ') || 'None'}\n` +
          `📱 WhatsApp: ${data.whatsapp_number || 'Not provided'}\n` +
          `🌐 URL: /${data.url}\n` +
          `📝 Description: ${data.project_info || 'No description available'}\n` +
          `📸 Profile Image: ${data.profile_image_url ? '✅' : '❌'}\n` +
          `🖼️ Hero Image: ${data.hero_img ? '✅' : '❌'}\n` +
          `🖼️ Gallery Images: ${data.gallery_image_urls?.length || 0}\n` +
          `📍 Location: ${data.location || 'Not provided'}`;

        return { 
          content: [{ 
            type: 'text', 
            text: details 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  // Tool to get products (e-commerce)
  server.tool(
    'get_products',
    'Get products from the Valle Sagrado e-commerce platform',
    {
      limit: z.number().int().min(1).max(50).optional().default(10),
      category: z.string().optional(),
      project_url: z.string().optional().describe('Filter by project URL')
    },
    async ({ limit, category, project_url }) => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .limit(limit);

        if (category) {
          query = query.eq('category', category);
        }

        if (project_url) {
          query = query.eq('project_url', project_url);
        }

        const { data, error } = await query;

        if (error) {
          return { 
            content: [{ 
              type: 'text', 
              text: `Error fetching products: ${error.message}` 
            }] 
          };
        }

        const productsList = data?.map(product => 
          `🛍️ **${product.name}** - $${product.price}\n` +
          `   SKU: ${product.sku}\n` +
          `   Category: ${product.category || 'Uncategorized'}\n` +
          `   Project: ${product.project_url || 'General'}\n` +
          `   Stock: ${product.stock_quantity || 'N/A'}\n`
        ).join('\n') || 'No products found';

        return { 
          content: [{ 
            type: 'text', 
            text: `🛒 **Valle Sagrado Products** (${data?.length || 0} found)\n\n${productsList}` 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  // Tool to get platform statistics
  server.tool(
    'get_platform_stats',
    'Get statistics about the Valle Sagrado platform',
    {},
    async () => {
      try {
        // Get projects count
        const { count: projectsCount } = await supabase
          .from('projects_info')
          .select('*', { count: 'exact', head: true });

        // Get products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Get recent projects
        const { data: recentProjects } = await supabase
          .from('projects_info')
          .select('name, url, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        const stats = `📊 **Valle Sagrado Platform Statistics**\n\n` +
          `👥 Total Projects: ${projectsCount || 0}\n` +
          `🛍️ Total Products: ${productsCount || 0}\n` +
          `📦 Total Orders: ${ordersCount || 0}\n\n` +
          `🆕 **Recent Projects:**\n` +
          (recentProjects?.map(p => `   • ${p.name} (/${p.url})`).join('\n') || 'None');

        return { 
          content: [{ 
            type: 'text', 
            text: stats 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  // Fun dice rolling tool (from the original example)
  server.tool(
    'roll_dice',
    'Rolls an N-sided die',
    { sides: z.number().int().min(2).max(100).default(6) },
    async ({ sides }) => {
      const value = 1 + Math.floor(Math.random() * sides);
      return { content: [{ type: 'text', text: `🎲 You rolled a ${value} on a ${sides}-sided die!` }] };
    }
  );
});

export { handler as GET, handler as POST, handler as DELETE }; 