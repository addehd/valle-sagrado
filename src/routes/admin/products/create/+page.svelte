<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  export let data: PageData;
  export let form: ActionData;
  
  const project = data.project;
  
  let sku = '';
  let slug = '';
  let name = '';
  let brand = '';
  let description = '';
  let price = '';
  let sale_price = '';
  let sale_start = '';
  let sale_end = '';
  let currency = 'USD';
  let stock = 0;
  let status = 'draft';
  let weight_grams = '';
  let dimensions_cm = '';
  let images: File[] = [];
  let categories = '';
  let attributes = '';
  let loading = false;

  function handleImages(event: Event) {
    images = Array.from((event.target as HTMLInputElement).files || []);
  }
</script>

<svelte:head>
  <title>Create Product - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-2xl mx-auto px-4">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p class="text-gray-600 mt-2">Add a new product to one of your projects</p>
      </div>

      {#if form?.error}
        <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {form.error}
        </div>
      {/if}

      <form 
        method="POST" 
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            await update();
            loading = false;
          };
        }}
        class="space-y-6"
      >
        <!-- Project Selection -->
        <div>
          <label for="project_id" class="block text-sm font-medium text-gray-700 mb-2">
            Project *
          </label>
          <select 
            id="project_id" 
            name="project_id" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a project...</option>
            {#each data.adminProjects as adminProject}
              <option value={adminProject.projects_info.id}>
                {adminProject.projects_info.name} ({adminProject.role})
              </option>
            {/each}
          </select>
        </div>

        <!-- Product Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea 
            id="description" 
            name="description" 
            required 
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your product"
          ></textarea>
        </div>

        <!-- Price -->
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01" 
              min="0" 
              required 
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Image URL -->
        <div>
          <label for="image_url" class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input 
            type="url" 
            id="image_url" 
            name="image_url" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input 
            type="text" 
            id="category" 
            name="category" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Electronics, Clothing, Books"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <a 
            href="/admin/products" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </a>
          <button 
            type="submit" 
            disabled={loading}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .input {
    @apply border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
</style>