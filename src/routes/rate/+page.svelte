<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	// use selected teacher from data or default to first teacher
	$: selectedTeacher = data.selectedTeacher || (data.teachers && data.teachers[0]);
	$: teacherId = selectedTeacher?.id;
</script>

<div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
	<h1 class="text-2xl font-semibold mb-6 text-center text-gray-800">rate teacher</h1>

	<!-- display server-side messages -->
	{#if form?.error}
		<div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
			<p class="font-bold">error!</p>
			<p>{form.error}</p>
			{#if form.field}
				<p class="text-sm">field: {form.field}</p>
			{/if}
		</div>
	{/if}

	{#if form?.success}
		<div class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" role="alert">
			<p class="font-bold">success!</p>
			<p>your rating (id: {form.ratingId}) has been submitted.</p>
		</div>
	{/if}

	<!-- teacher selection if available -->
	{#if data.teachers && data.teachers.length > 0}
		<form method="post" use:enhance class="space-y-4">
			<!-- teacher select dropdown -->
			{#if !data.selectedTeacher}
				<div>
					<label for="teacher_id" class="block text-sm font-medium text-gray-700">select teacher</label>
					<select
						id="teacher_id"
						name="teacher_id"
						required
						class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					>
						{#each data.teachers as teacher}
							<option value={teacher.id}>{teacher.name}</option>
						{/each}
					</select>
				</div>
			{:else}
				<!-- hidden input for pre-selected teacher -->
				<input type="hidden" name="teacher_id" value={teacherId} />
				<div class="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
					<p>rating: <span class="font-semibold">{selectedTeacher.name}</span></p>
				</div>
			{/if}

			<!-- reviewer name input -->
			<div>
				<label for="reviewer_name" class="block text-sm font-medium text-gray-700">your name (optional)</label>
				<input
					type="text"
					id="reviewer_name"
					name="reviewer_name"
					class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<!-- stars rating input -->
			<div>
				<label for="stars" class="block text-sm font-medium text-gray-700">rating (1-5 stars)</label>
				<input
					type="number"
					id="stars"
					name="stars"
					min="1"
					max="5"
					required
					class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
				{#if form?.field === 'stars'}
					<p class="mt-1 text-sm text-red-600">{form.error}</p>
				{/if}
			</div>

			<!-- review text input -->
			<div>
				<label for="text" class="block text-sm font-medium text-gray-700">review (optional)</label>
				<textarea
					id="text"
					name="text"
					rows="4"
					class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				></textarea>
			</div>

			<!-- submit button -->
			<div>
				<button
					type="submit"
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					submit rating
				</button>
			</div>
		</form>
	{:else}
		<div class="text-center p-4 border border-gray-200 rounded bg-gray-50">
			<p>no teachers available to rate</p>
		</div>
	{/if}
</div>
