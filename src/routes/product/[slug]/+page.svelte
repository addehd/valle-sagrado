<script lang="ts">
  import AddToCart from '../../../components/AddToCart.svelte';
  
  export let data;
  const product = data.product;
</script>

{#if product}
  <main class="container mx-auto px-6 py-12">
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
    </div>
  </main>
{:else}
  <div class="container mx-auto px-6 py-12">
    <p class="text-red-600">Product not found.</p>
  </div>
{/if} 