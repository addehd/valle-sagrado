import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  // Get user's boards first
  const { data: boards, error: boardsError } = await supabase
    .from('flow_boards')
    .select('*')
    .order('created_at', { ascending: true });

  if (boardsError) {
    console.error('Error loading boards:', boardsError);
    throw error(500, 'Failed to load boards');
  }

  // Get columns and tasks separately to avoid relationship issues
  let boardsWithData = [];
  
  if (boards && boards.length > 0) {
    for (const board of boards) {
      // Get columns for this board
      const { data: columns, error: columnsError } = await supabase
        .from('flow_columns')
        .select('*')
        .eq('board_id', board.id)
        .order('position', { ascending: true });

      if (columnsError) {
        console.error('Error loading columns:', columnsError);
        continue;
      }

      // Get tasks for each column
      const columnsWithTasks = [];
      if (columns) {
        for (const column of columns) {
          const { data: tasks, error: tasksError } = await supabase
            .from('flow_tasks')
            .select('*')
            .eq('column_id', column.id)
            .order('position', { ascending: true });

          if (tasksError) {
            console.error('Error loading tasks:', tasksError);
          }

          columnsWithTasks.push({
            ...column,
            flow_tasks: tasks || []
          });
        }
      }

      boardsWithData.push({
        ...board,
        flow_columns: columnsWithTasks
      });
    }
  }

  // If no boards exist, create a default one
  if (!boardsWithData || boardsWithData.length === 0) {
    const { data: newBoard, error: createError } = await supabase
      .from('flow_boards')
      .insert({
        user_id: session.user.id,
        title: 'My First Board',
        description: 'A simple kanban board to get started'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating default board:', createError);
      throw error(500, 'Failed to create default board');
    }

    // Create default columns
    const { data: createdColumns, error: columnsError } = await supabase
      .from('flow_columns')
      .insert([
        { board_id: newBoard.id, title: 'To Do', position: 1, color: '#EF4444' },
        { board_id: newBoard.id, title: 'In Progress', position: 2, color: '#F59E0B' },
        { board_id: newBoard.id, title: 'Done', position: 3, color: '#10B981' }
      ])
      .select();

    if (columnsError) {
      console.error('Error creating default columns:', columnsError);
      // If column creation fails, return board without columns
      return {
        boards: [{
          ...newBoard,
          flow_columns: []
        }]
      };
    }

    // Return the newly created board with actual created columns
    const columnsWithTasks = (createdColumns || []).map(column => ({
      ...column,
      flow_tasks: []
    }));

    return {
      boards: [{
        ...newBoard,
        flow_columns: columnsWithTasks
      }]
    };
  }

  return {
    boards: boardsWithData
  };
};

export const actions: Actions = {
  createTask: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const columnId = formData.get('column_id') as string;
    const boardId = formData.get('board_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!columnId || !boardId || !title) {
      return fail(400, { message: 'Missing required fields' });
    }

    // Get the next position for this column
    const { data: tasks, error: countError } = await supabase
      .from('flow_tasks')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1);

    if (countError) {
      console.error('Error getting task count:', countError);
      return fail(500, { message: 'Failed to get task position' });
    }

    const nextPosition = tasks && tasks.length > 0 ? tasks[0].position + 1 : 1;

    const { data: task, error: createError } = await supabase
      .from('flow_tasks')
      .insert({
        column_id: columnId,
        board_id: boardId,
        title,
        description: description || null,
        position: nextPosition
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return fail(500, { message: 'Failed to create task' });
    }

    return { success: true, task };
  },

  updateTask: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const taskId = formData.get('task_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!taskId || !title) {
      return fail(400, { message: 'Missing required fields' });
    }

    const { data: task, error: updateError } = await supabase
      .from('flow_tasks')
      .update({
        title,
        description: description || null
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return fail(500, { message: 'Failed to update task' });
    }

    return { success: true, task };
  },

  moveTask: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const taskId = formData.get('task_id') as string;
    const newColumnId = formData.get('new_column_id') as string;
    const newPosition = parseInt(formData.get('new_position') as string);

    if (!taskId || !newColumnId || isNaN(newPosition)) {
      return fail(400, { message: 'Missing required fields' });
    }

    const { data: task, error: moveError } = await supabase
      .from('flow_tasks')
      .update({
        column_id: newColumnId,
        position: newPosition
      })
      .eq('id', taskId)
      .select()
      .single();

    if (moveError) {
      console.error('Error moving task:', moveError);
      return fail(500, { message: 'Failed to move task' });
    }

    return { success: true, task };
  },

  deleteTask: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const taskId = formData.get('task_id') as string;

    if (!taskId) {
      return fail(400, { message: 'Missing task ID' });
    }

    const { error: deleteError } = await supabase
      .from('flow_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      return fail(500, { message: 'Failed to delete task' });
    }

    return { success: true };
  }
};
