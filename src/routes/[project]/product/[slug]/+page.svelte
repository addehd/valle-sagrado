<script lang="ts">
  import AddToCart from '../../../../components/AddToCart.svelte';
  import CartHeader from '../../../../components/CartHeader.svelte';
  
  export let data;
  const product = data.product;
  const project = data.project;
</script>

<svelte:head>
  <title>{product ? `${product.name} - ${project?.name || 'Product'}` : 'Product Not Found'}</title>
</svelte:head>

{#if product && project}
  <main class="container mx-auto px-6 py-12">
    <!-- Breadcrumb Navigation with Cart -->
    <div class="flex items-center justify-between mb-6">
      <nav>
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li><a href="/{project.url}" class="hover:text-blue-600">{project.name}</a></li>
          <li class="flex items-center">
            <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-gray-900">{product.name}</span>
          </li>
        </ol>
      </nav>
      
      <!-- Cart Component -->
      <CartHeader projectSlug={project.url} />
    </div>

    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <img src={Array.isArray(product.images) ? product.images[0] : '/images/placeholder.jpg'} alt={product.name} class="rounded-lg mb-4 w-full" />
      <h1 class="text-3xl font-bold mb-2">{product.name}</h1>
      <p class="text-lg text-gray-700 mb-4">{product.price} {product.currency}</p>
      <p class="text-gray-600 mb-6">{product.description}</p>
      
      {#if product.stock > 0}
        <div class="flex items-center gap-4 mb-4">
          <span class="text-sm text-gray-600">Stock: {product.stock} available</span>
          <span class="text-sm text-green-600">✓ In Stock</span>
        </div>
        <AddToCart 
          productSku={product.sku}
          productName={product.name}
          size="lg"
        />
      {:else}
        <div class="text-red-600 font-medium mb-4">Out of Stock</div>
        <AddToCart 
          productSku={product.sku}
          productName={product.name}
          disabled={true}
          size="lg"
        />
      {/if}

      <!-- Navigation buttons -->
      <div class="mt-8 flex gap-4">
        <a 
          href="/{project.url}"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          ← Back to {project.name}
        </a>
        <a 
          href="/{project.url}/cart"
          class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
        >
          View Cart
        </a>
      </div>
    </div>
  </main>
{:else}
  <div class="container mx-auto px-6 py-12">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-red-600 mb-4">
        Product not found
      </h1>
      {#if project}
        <a 
          href="/{project.url}"
          class="text-blue-600 hover:text-blue-800 underline"
        >
          Return to {project.name}
        </a>
      {:else}
        <a 
          href="/"
          class="text-blue-600 hover:text-blue-800 underline"
        >
          Return to Home
        </a>
      {/if}
    </div>
  </div>
{/if} 