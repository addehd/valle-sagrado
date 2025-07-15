<script lang="ts">
  interface MetaTagsProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    siteName?: string;
    keywords?: string;
    author?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
    canonical?: string;
    robots?: string;
    ogLocale?: string;
    articleAuthor?: string;
    articlePublishedTime?: string;
    articleModifiedTime?: string;
    productPrice?: string;
    productCurrency?: string;
    productAvailability?: 'in stock' | 'out of stock' | 'preorder';
    productBrand?: string;
    productCategory?: string;
  }

  let {
    title = 'Valle Sagrado',
    description = 'Discover unique local projects, artisans, and experiences from the Sacred Valley. Connect with local communities and explore authentic Peruvian culture.',
    image = '/images/valle.jpg',
    url = '',
    type = 'website',
    siteName = 'Valle Sagrado',
    keywords = 'Valle Sagrado, Sacred Valley, Peru, local artisans, authentic experiences, Peruvian culture, tourism, handmade products',
    author = 'Valle Sagrado',
    twitterCard = 'summary_large_image',
    twitterSite = '@vallesagrado',
    twitterCreator = '@vallesagrado',
    canonical = '',
    robots = 'index, follow',
    ogLocale = 'en_US',
    articleAuthor = '',
    articlePublishedTime = '',
    articleModifiedTime = '',
    productPrice = '',
    productCurrency = 'USD',
    productAvailability = 'in stock',
    productBrand = '',
    productCategory = ''
  }: MetaTagsProps = $props();

  // Ensure title is within SEO best practices (50-60 characters)
  const optimizedTitle = $derived(title.length > 60 ? title.substring(0, 57) + '...' : title);
  
  // Ensure description is within SEO best practices (150-160 characters)
  const optimizedDescription = $derived(description.length > 160 ? description.substring(0, 157) + '...' : description);
  
  // Ensure image URL is absolute
  const absoluteImage = $derived(image.startsWith('http') ? image : `https://vallesagrado.com${image}`);
  
  // Ensure URL is absolute
  const absoluteUrl = $derived(url.startsWith('http') ? url : `https://vallesagrado.com${url}`);
  
  // Canonical URL
  const canonicalUrl = $derived(canonical || absoluteUrl);
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{optimizedTitle}</title>
  <meta name="description" content={optimizedDescription} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  {#if author}
    <meta name="author" content={author} />
  {/if}
  <meta name="robots" content={robots} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Canonical URL -->
  {#if canonicalUrl}
    <link rel="canonical" href={canonicalUrl} />
  {/if}
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content={optimizedTitle} />
  <meta property="og:description" content={optimizedDescription} />
  <meta property="og:image" content={absoluteImage} />
  <meta property="og:url" content={absoluteUrl} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content={ogLocale} />
  
  <!-- Article-specific Open Graph tags -->
  {#if type === 'article'}
    {#if articleAuthor}
      <meta property="article:author" content={articleAuthor} />
    {/if}
    {#if articlePublishedTime}
      <meta property="article:published_time" content={articlePublishedTime} />
    {/if}
    {#if articleModifiedTime}
      <meta property="article:modified_time" content={articleModifiedTime} />
    {/if}
  {/if}
  
  <!-- Product-specific Open Graph tags -->
  {#if type === 'product'}
    {#if productPrice}
      <meta property="product:price:amount" content={productPrice} />
      <meta property="product:price:currency" content={productCurrency} />
    {/if}
    {#if productAvailability}
      <meta property="product:availability" content={productAvailability} />
    {/if}
    {#if productBrand}
      <meta property="product:brand" content={productBrand} />
    {/if}
    {#if productCategory}
      <meta property="product:category" content={productCategory} />
    {/if}
  {/if}
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content={twitterCard} />
  <meta name="twitter:title" content={optimizedTitle} />
  <meta name="twitter:description" content={optimizedDescription} />
  <meta name="twitter:image" content={absoluteImage} />
  {#if twitterSite}
    <meta name="twitter:site" content={twitterSite} />
  {/if}
  {#if twitterCreator}
    <meta name="twitter:creator" content={twitterCreator} />
  {/if}
  
  <!-- Additional SEO Meta Tags -->
  <meta name="theme-color" content="#3B82F6" />
  <meta name="msapplication-TileColor" content="#3B82F6" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content={siteName} />
  
  <!-- Preconnect to external domains for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  
  <!-- DNS prefetch for better performance -->
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
</svelte:head> 