<nav class="bg-white shadow py-4">
  <div class="container mx-auto px-6 flex items-center justify-between">
    <!-- Left -->
    <a href="/" class="text-sm font-medium text-gray-700 hover:text-gray-900">Shop our products</a>

    <!-- Center: Logo -->
    <div class="flex items-center space-x-2">
      <img src="/logo-left.svg" alt="Lion" class="h-6" />
      <img src="/logo-right.svg" alt="Rebel" class="h-6" />
    </div>

    <!-- Right: Icons -->
    <div class="flex items-center space-x-4 text-gray-600">
      <button aria-label="Search"><i class="ti ti-search w-6 h-6"></i></button>
      <button aria-label="Wishlist"><i class="ti ti-heart w-6 h-6"></i></button>
      <button aria-label="Account"><i class="ti ti-user w-6 h-6"></i></button>
      <button aria-label="Cart"><i class="ti ti-shopping-bag w-6 h-6"></i></button>
    </div>
  </div>
</nav>

<main class="container mx-auto px-6 py-12">
  <!-- Hero + Products -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <!-- Hero Image with Hotspots -->
    <div class="relative">
      <img src="/images/hero-product.jpg" alt="Hero product" class="rounded-lg w-full object-cover" />
      <!-- Example Hotspot -->
      <button class="absolute top-1/3 left-1/4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
        <span class="sr-only">Hotspot</span>
      </button>
      <!-- Add more hotspots as needed -->
    </div>

    <!-- Text + Product Cards -->
    <div class="flex flex-col justify-center">
      <h1 class="text-4xl font-bold mb-2">Complete the feeling</h1>
      <p class="text-lg text-gray-600 mb-6">For a fierce and elegant look this spring</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Product Card -->
        <div class="bg-gray-100 rounded-xl p-4">
          <img src="/images/product-cap.jpg" alt="Classic Cap Jet Black" class="rounded-lg mb-4 w-full" />
          <h2 class="font-semibold mb-1">Classic Cap Jet Black</h2>
          <p class="text-gray-700">40 USD</p>
        </div>

        <div class="bg-gray-100 rounded-xl p-4">
          <img src="/images/product-hoodie.jpg" alt="Fit Zip Hoodie Jet Black" class="rounded-lg mb-4 w-full" />
          <h2 class="font-semibold mb-1">Fit Zip Hoodie Jet Black</h2>
          <p class="text-gray-700">40 USD</p>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Newsletter Banner -->
<section class="bg-[url('/images/pattern-bg.svg')] bg-cover">
  <div class="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between">
    <div class="mb-6 lg:mb-0 flex items-center space-x-4">
      <img src="/images/example1.jpg" alt="Example 1" class="w-12 h-12 object-cover rounded-full border" />
      <div>
        <h2 class="text-2xl font-bold">Become a Lion & Rebel Insider</h2>
        <p class="text-gray-600">15% welcome gift and much more</p>
      </div>
    </div>
    <form class="flex w-full max-w-sm">
      <input type="email" placeholder="Email" required
             class="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none" />
      <button type="submit"
              class="px-6 py-2 bg-gray-800 text-white rounded-r-lg hover:bg-gray-700 focus:outline-none">
        Join now
      </button>
    </form>
  </div>
</section>
