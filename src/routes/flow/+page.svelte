<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showNewTaskModal = false;
	let selectedColumn = '';
	let selectedBoard = '';
	let editingTask: any = null;
	let draggedTask: any = null;
	let draggedOverColumn: string = '';
	let isMovingTask = false;
	let optimisticColumns: any[] = [];

	// Get the first board (simple implementation)
	$: board = data.boards?.[0];
	$: baseColumns = board?.flow_columns?.sort((a: any, b: any) => a.position - b.position) || [];
	
	// Use optimistic columns if available, otherwise use base columns
	$: columns = optimisticColumns.length > 0 ? optimisticColumns : baseColumns;

	function openNewTaskModal(columnId: string, boardId: string) {
		selectedColumn = columnId;
		selectedBoard = boardId;
		showNewTaskModal = true;
	}

	function closeModal() {
		showNewTaskModal = false;
		editingTask = null;
		selectedColumn = '';
		selectedBoard = '';
	}

	function editTask(task: any) {
		editingTask = task;
		showNewTaskModal = true;
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high': return 'bg-red-100 text-red-800';
			case 'medium': return 'bg-yellow-100 text-yellow-800';
			case 'low': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	// Create optimistic update for instant visual feedback
	function createOptimisticUpdate(taskToMove: any, targetColumnId: string) {
		const newColumns = baseColumns.map(column => ({
			...column,
			flow_tasks: column.flow_tasks ? [...column.flow_tasks] : []
		}));

		// Remove task from source column
		const sourceColumn = newColumns.find(col => col.id === taskToMove.column_id);
		if (sourceColumn) {
			sourceColumn.flow_tasks = sourceColumn.flow_tasks.filter(task => task.id !== taskToMove.id);
		}

		// Add task to target column
		const targetColumn = newColumns.find(col => col.id === targetColumnId);
		if (targetColumn) {
			const updatedTask = { ...taskToMove, column_id: targetColumnId };
			targetColumn.flow_tasks = [...targetColumn.flow_tasks, updatedTask];
		}

		return newColumns;
	}

	// Reset to server data
	function resetOptimisticState() {
		optimisticColumns = [];
		isMovingTask = false;
		draggedTask = null;
		draggedOverColumn = '';
	}

	// Drag and drop functions
	function handleDragStart(event: DragEvent, task: any) {
		if (!event.dataTransfer) return;
		
		draggedTask = task;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/html', (event.target as HTMLElement)?.outerHTML || '');
		
		// Add dragging class to the element
		if (event.target instanceof HTMLElement) {
			event.target.classList.add('dragging');
		}
	}

	function handleDragEnd(event: DragEvent) {
		draggedTask = null;
		draggedOverColumn = '';
		
		// Remove dragging class
		if (event.target instanceof HTMLElement) {
			event.target.classList.remove('dragging');
		}
		
		// Remove all drag-over classes
		document.querySelectorAll('.drag-over').forEach(el => {
			el.classList.remove('drag-over');
		});
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragEnter(event: DragEvent, columnId: string) {
		event.preventDefault();
		draggedOverColumn = columnId;
		
		// Add visual feedback
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.classList.add('drag-over');
		}
	}

	function handleDragLeave(event: DragEvent) {
		// Only remove drag-over if we're actually leaving the column
		if (event.currentTarget instanceof HTMLElement && 
			!event.currentTarget.contains(event.relatedTarget as Node)) {
			event.currentTarget.classList.remove('drag-over');
		}
	}

	async function handleDrop(event: DragEvent, targetColumnId: string) {
		event.preventDefault();
		
		if (!draggedTask || draggedTask.column_id === targetColumnId) {
			return;
		}

		// 🚀 INSTANT VISUAL UPDATE - Apply optimistic update immediately
		optimisticColumns = createOptimisticUpdate(draggedTask, targetColumnId);
		isMovingTask = true;

		// Get the target column tasks to determine new position
		const targetColumn = baseColumns.find(col => col.id === targetColumnId);
		const newPosition = (targetColumn?.flow_tasks?.length || 0) + 1;

		// Create form data for the move action
		const formData = new FormData();
		formData.append('task_id', draggedTask.id);
		formData.append('new_column_id', targetColumnId);
		formData.append('new_position', newPosition.toString());

		// Clean up drag state immediately for better UX
		const taskToMove = draggedTask;
		draggedTask = null;
		draggedOverColumn = '';
		
		// Remove drag-over class
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.classList.remove('drag-over');
		}

		try {
			// Submit the move request in the background
			const response = await fetch('?/moveTask', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Success! Sync with server data
				await invalidateAll();
				resetOptimisticState();
			} else {
				console.error('Failed to move task');
				// Rollback optimistic update on failure
				resetOptimisticState();
			}
		} catch (error) {
			console.error('Error moving task:', error);
			// Rollback optimistic update on error
			resetOptimisticState();
		}
	}
</script>

<svelte:head>
	<title>Flow - Kanban Board</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="max-w-7xl mx-auto">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-gray-900">
				{board?.title || 'Kanban Board'}
			</h1>
			{#if board?.description}
				<p class="text-gray-600 mt-2">{board.description}</p>
			{/if}
		</div>

		{#if form?.message}
			<div class="mb-4 p-4 rounded-md {form.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{form.message}
			</div>
		{/if}

		{#if columns.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each columns as column}
					<div 
						class="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 relative"
						class:drag-over={draggedOverColumn === column.id}
						class:loading={isMovingTask && draggedOverColumn === column.id}
						ondragover={handleDragOver}
						ondragenter={(e) => handleDragEnter(e, column.id)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, column.id)}
					>
						<!-- Column Header -->
						<div class="p-4 border-b border-gray-200">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div 
										class="w-3 h-3 rounded-full" 
										style="background-color: {column.color}"
									></div>
									<h3 class="font-semibold text-gray-900">{column.title}</h3>
									<span class="text-sm text-gray-500">
										({column.flow_tasks?.length || 0})
									</span>
									{#if isMovingTask && draggedOverColumn === column.id}
										<div class="inline-flex items-center">
											<svg class="animate-spin h-3 w-3 text-blue-500 ml-1" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										</div>
									{/if}
								</div>
								<button 
									onclick={() => openNewTaskModal(column.id, board.id)}
									class="text-gray-400 hover:text-gray-600 p-1 rounded"
									title="Add task"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</button>
							</div>
						</div>

						<!-- Tasks -->
						<div class="p-4 space-y-3 min-h-[200px]">
							{#each (column.flow_tasks || []).sort((a: any, b: any) => a.position - b.position) as task}
								<div 
									class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-all duration-200 group cursor-move"
									class:dragging={draggedTask?.id === task.id}
									draggable="true"
									ondragstart={(e) => handleDragStart(e, task)}
									ondragend={handleDragEnd}
								>
									<div class="flex items-start justify-between gap-2">
										<div class="flex-1 min-w-0">
											<h4 class="font-medium text-gray-900 text-sm leading-tight">
												{task.title}
											</h4>
											{#if task.description}
												<p class="text-gray-600 text-xs mt-1 line-clamp-2">
													{task.description}
												</p>
											{/if}
											{#if task.priority && task.priority !== 'medium'}
												<div class="mt-2">
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getPriorityColor(task.priority)}">
														{task.priority}
													</span>
												</div>
											{/if}
										</div>
										
										<!-- Task Actions -->
										<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<button 
												onclick={() => editTask(task)}
												class="text-gray-400 hover:text-blue-600 p-1 rounded"
												title="Edit task"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<form method="POST" action="?/deleteTask" use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														await invalidateAll();
													}
												}
											}}>
												<input type="hidden" name="task_id" value={task.id} />
												<button 
													type="submit"
													class="text-gray-400 hover:text-red-600 p-1 rounded"
													title="Delete task"
													onclick={(e) => {
														if (!confirm('Delete this task?')) {
															e.preventDefault();
														}
													}}
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</form>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-12">
				<p class="text-gray-500">No columns found. The board will be set up automatically.</p>
			</div>
		{/if}
	</div>
</div>

<!-- New/Edit Task Modal -->
{#if showNewTaskModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">
				{editingTask ? 'Edit Task' : 'New Task'}
			</h2>
			
			<form 
				method="POST" 
				action={editingTask ? "?/updateTask" : "?/createTask"}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							closeModal();
							await invalidateAll();
						}
					}
				}}
			>
				{#if !editingTask}
					<input type="hidden" name="column_id" value={selectedColumn} />
					<input type="hidden" name="board_id" value={selectedBoard} />
				{:else}
					<input type="hidden" name="task_id" value={editingTask.id} />
				{/if}

				<div class="space-y-4">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
							Title *
						</label>
						<input 
							type="text" 
							id="title"
							name="title" 
							value={editingTask?.title || ''}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter task title..."
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea 
							id="description"
							name="description" 
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter task description..."
						>{editingTask?.description || ''}</textarea>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button 
						type="submit"
						class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						{editingTask ? 'Update Task' : 'Create Task'}
					</button>
					<button 
						type="button"
						onclick={closeModal}
						class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Drag and drop styles */
	.dragging {
		opacity: 0.5;
		transform: rotate(5deg) scale(1.05);
		z-index: 1000;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		transition: all 0.1s ease-out;
	}

	.drag-over {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: #3b82f6;
		border-style: dashed;
		transform: scale(1.02);
		animation: pulse-border 1s ease-in-out infinite;
	}

	.loading {
		background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0.05) 100%);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes pulse-border {
		0%, 100% { border-color: #3b82f6; }
		50% { border-color: #60a5fa; }
	}

	@keyframes shimmer {
		0% { background-position: -200px 0; }
		100% { background-position: 200px 0; }
	}

	/* Smooth animations for task movement */
	.group {
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		will-change: transform;
	}

	.group:hover:not(.dragging) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	/* Column animations */
	.bg-white {
		transition: all 0.2s ease-in-out;
	}

	/* Task card animations */
	.cursor-move:active {
		cursor: grabbing;
	}

	/* Drag ghost styling */
	.dragging * {
		pointer-events: none;
	}
</style>
