<script lang="ts">
  import { onMount } from 'svelte';

  export let ratings: any[] = []; // initialize as empty array

  // derived reactive variables
  let activeStars: number = 0;
  let reviewCount: number = 0;
  let distribution: { star: number, count: number }[] = [];
  let reviews: {
    name: string;
    date: string;
    stars: number;
    text: string;
    avatar: string;
  }[] = [];

  $: {
    if (ratings && ratings.length > 0) {
      reviewCount = ratings.length;
      const totalStarsSum = ratings.reduce((sum, rating) => sum + rating.stars, 0);
      activeStars = parseFloat((totalStarsSum / reviewCount).toFixed(1)); // average stars

      // calculate star distribution
      const starCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        if (rating.stars >= 1 && rating.stars <= 5) {
          starCounts[rating.stars]++;
        }
      });
      distribution = Object.entries(starCounts)
        .map(([star, count]) => ({ star: parseInt(star), count }))
        .sort((a, b) => b.star - a.star); // sort from 5 to 1

      // map ratings to reviews format
      reviews = ratings.map(rating => ({
        name: rating.reviewer_name,
        // format date nicely - requires a date formatting library or manual formatting
        date: new Date(rating.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 
        stars: rating.stars,
        text: rating.text,
        avatar: rating.reviewer_avatar || 'https://via.placeholder.com/150' // default avatar
      }));
    } else {
      activeStars = 0;
      reviewCount = 0;
      distribution = [
        { star: 5, count: 0 },
        { star: 4, count: 0 },
        { star: 3, count: 0 },
        { star: 2, count: 0 },
        { star: 1, count: 0 }
      ];
      reviews = [];
    }
  }

  // calculate total count for distribution bars
  $: totalCount = distribution.reduce((sum, item) => sum + item.count, 0);

</script>

<div class="p-6 bg-white rounded-lg shadow-md my-4">
  <h2 class="text-lg font-semibold mb-2">Teacher Rating</h2>

  {#if ratings && ratings.length > 0}
    <div class="rating-component">
      <div class="flex items-center space-x-4 mb-3">
        <div class="flex items-center space-x-1">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span class="text-sm font-medium text-gray-800">{activeStars}</span>
        </div>
        <span class="text-gray-500 text-xs">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
      </div>

      <!-- distribution section -->
      <div>
        <ul class="space-y-1">
          {#each distribution as {star, count}}
            <li class="flex items-center space-x-2 {count === 0 ? 'text-gray-400' : ''}">
              <span class="w-4 text-sm {count > 0 ? 'font-medium' : ''}">{star}</span>
              <div class="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                <div class="{count > 0 ? 'bg-yellow-400' : 'bg-gray-400'} h-2"
                     style="width: {totalCount > 0 ? (count / totalCount) * 100 : 0}%;"></div>
              </div>
              <span class="text-sm {count > 0 ? 'text-gray-600' : ''} w-10 text-right">({count})</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- reviews section -->
    <ul class="space-y-6 mt-6">
      {#each reviews as review (review.name + review.date)} <!-- use a unique key if possible -->
        <li class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <div class="flex items-start gap-4">
            <img src={review.avatar} alt={review.name} class="w-12 h-12 rounded-full object-cover" /> <!-- added object-cover -->
            <div class="flex-1">
              <p class="font-semibold text-primary">{review.name}</p>
              <p class="text-sm text-gray-500">{review.date}</p>
            </div>
          </div>

          <!-- star rating display -->
          <div class="flex">
            {#each { length: 5 } as _, i}
              {@const starIndex = i + 1}
              {#if starIndex <= review.stars}
                <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              {:else}
                <svg class="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 24 24">
                   <path d="M22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
                </svg>
              {/if}
            {/each}
          </div>

          <p class="text-base text-gray-800">{review.text}</p>

          <!-- action buttons -->
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <button class="underline hover:text-gray-800">Show more</button>
            <button class="flex items-center gap-1 hover:text-gray-800">
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              Translate <!-- updated text -->
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-gray-500">no ratings jet</p>
  {/if}
</div>