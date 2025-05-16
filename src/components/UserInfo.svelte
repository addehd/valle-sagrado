<script lang="ts">
  import Rating from "./Rating.svelte"

  interface $$Props {
    name: string;
    teacher_info: string;
    countryFlag: string | null;
    subjectText: string;
    // ratings: any[];
    profile_image_url?: string;
    isVerified?: boolean;
    refundText?: string;
    refundSubtext?: string;
    subjectLink?: string;
    subjectLinkText?: string;
    location?: string | null;
    gallery_image_urls?: string[] | null;
    tags?: string[] | null;
  }

  let {
    name,
    teacher_info,
    countryFlag,
    subjectText,
    // ratings,
    profile_image_url = "/images/ruben.jpg",
    isVerified = true,
    refundText = "Provperioder är 100 % återbetalningsbara",
    refundSubtext = "Prova en annan lärare kostnadsfritt eller få återbetalning",
    subjectLink = "https://preply.com/sv/online/musik-larare",
    subjectLinkText = "Musik lektioner",
    location = null,
    gallery_image_urls = [],
    tags = []
  }: $$Props = $props();

</script>

<div class="flex flex-col md:flex-row gap-6 items-start">
  <section class="flex flex-col gap-4 flex-grow">
    <div class="flex items-center gap-2 flex-wrap">
      <div class="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        <img class="w-full h-full object-cover" src={profile_image_url} alt={name} />
        <div class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-2 items-center">
          <h1 class="text-2xl font-bold text-gray-800">{name}</h1>
          {#if isVerified}
            <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 3H4v15l8 4 8-4V3zm-1.5 12.414 6.707-6.707-1.414-1.414-5.293 5.293-2.293-2.293-1.414 1.414z" />
            </svg>
          {/if}
          {#if countryFlag}
            <img src={`/images/flags/${countryFlag}.svg`} alt="Country flag" class="w-5 h-4" />
          {/if}
        </div>

        <h2 class="text-lg text-gray-600">{teacher_info}</h2>

        <div class="flex flex-row">
          {#each tags ?? [] as tag}
            <span class="text-sm text-gray-600 space-x-2 bg-gray-100 px-2 py-1 rounded-full">{tag}</span>
          {/each}
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mt-2">
      <div class="flex gap-3 items-start">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.291 4.055 12 2 8.709 4.055l-3.78.874-.874 3.78L2 12l2.055 3.291.874 3.78 3.78.874L12 22l3.291-2.055 3.78-.874.874-3.78L22 12l-2.055-3.291-.874-3.78zM9.793 15.707l.707.707.707-.707 6-6-1.414-1.414-5.293 5.293-2.293-2.293-1.414 1.414z" />
        </svg>
        <div>
          <p class="font-semibold text-blue-600">{refundText}</p>
          <p class="text-gray-600 text-sm">{refundSubtext}</p>
        </div>
      </div>
      <div class="flex gap-3 items-start">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
          <path fill="currentColor" d="m12 21-7-3.8v-6L1 9l11-6 11 6v8h-2v-6.9l-2 1.1v6zm0-8.3L18.85 9 12 5.3 5.15 9zm0 6.025 5-2.7V12.25L12 15l-5-2.75v3.775z" />
        </svg>
        <div>
          <p class="font-semibold text-blue-600">{subjectText}</p>
          <a href={subjectLink} class="text-blue-500 hover:underline text-sm">{subjectLinkText}</a>
        </div>
      </div>
    </div>

    <!-- <Rating ratings={ratings} /> -->
  </section>
</div> 

