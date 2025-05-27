<script lang="ts">
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

  let error = '';
  let success = '';

  function handleImages(event: Event) {
    images = Array.from((event.target as HTMLInputElement).files || []);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    error = '';
    success = '';
    try {
      const formData = new FormData();
      formData.append('sku', sku);
      formData.append('slug', slug);
      formData.append('name', name);
      formData.append('brand', brand);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('sale_price', sale_price);
      formData.append('sale_start', sale_start);
      formData.append('sale_end', sale_end);
      formData.append('currency', currency);
      formData.append('stock', stock.toString());
      formData.append('status', status);
      formData.append('weight_grams', weight_grams);
      formData.append('dimensions_cm', dimensions_cm);
      images.forEach((img) => formData.append('images', img));
      formData.append('categories', categories);
      formData.append('attributes', attributes);

      const res = await fetch('/create-product', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        error = (await res.json()).error || 'Failed to create product.';
      } else {
        success = 'Product created!';
        // Optionally redirect or reset form
        // goto('/products');
      }
    } catch (e) {
      error = 'Error: ' + e;
    }
  }
</script>

<main class="container mx-auto px-6 py-12 max-w-2xl">
  <h1 class="text-3xl font-bold mb-6">Create Product</h1>
  {#if error}
    <div class="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
  {/if}
  {#if success}
    <div class="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>
  {/if}
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label>SKU</label>
        <input class="input" bind:value={sku} required />
      </div>
      <div>
        <label>Slug</label>
        <input class="input" bind:value={slug} required />
      </div>
      <div>
        <label>Name</label>
        <input class="input" bind:value={name} required />
      </div>
      <div>
        <label>Brand</label>
        <input class="input" bind:value={brand} />
      </div>
      <div>
        <label>Price</label>
        <input class="input" type="number" step="0.01" bind:value={price} required />
      </div>
      <div>
        <label>Sale Price</label>
        <input class="input" type="number" step="0.01" bind:value={sale_price} />
      </div>
      <div>
        <label>Sale Start</label>
        <input class="input" type="datetime-local" bind:value={sale_start} />
      </div>
      <div>
        <label>Sale End</label>
        <input class="input" type="datetime-local" bind:value={sale_end} />
      </div>
      <div>
        <label>Currency</label>
        <input class="input" bind:value={currency} maxlength="3" required />
      </div>
      <div>
        <label>Stock</label>
        <input class="input" type="number" bind:value={stock} required />
      </div>
      <div>
        <label>Status</label>
        <select class="input" bind:value={status} required>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div>
        <label>Weight (grams)</label>
        <input class="input" type="number" bind:value={weight_grams} />
      </div>
    </div>
    <div>
      <label>Description</label>
      <textarea class="input w-full" rows="3" bind:value={description} required></textarea>
    </div>
    <div>
      <label>Dimensions (JSON)</label>
      <!-- <input class="input w-full" placeholder='{"length":10,"width":5,"height":2}' bind:value={dimensions_cm} /> -->
    </div>
    <div>
      <label>Categories (JSON array)</label>
      <input class='input w-full' bind:value={categories} />
    </div>
    <div>
      <label>Attributes (JSON object)</label>
      <input class='input w-full' bind:value={attributes} />
    </div>
    <div>
      <label>Images</label>
      <input class="input" type="file" multiple accept="image/*" on:change={handleImages} />
    </div>
    <button type="submit" class="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Create Product</button>
  </form>
</main>

<!-- <style>
  .input {
    @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400;
  }
</style>  -->