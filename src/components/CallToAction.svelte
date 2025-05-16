<script lang="ts">
  export let videoId = "CfzKCbxfGRo"
  export let rating = 5
  export let reviews = 8
  export let lessons = 498
  export let price = 75
  export let currency = "PEN"
  export let lessonDuration = "50-minuters lektion"
  export let buyText = "Köp provlektion"
  export let messageText = "Skicka meddelande"
  export let saveText = "Save to my list"
</script>

<div class="text-sm font-sans antialiased w-[420px] h-fit bg-white rounded-lg shadow-lg overflow-hidden leading-[1.43]">
  <div class="relative">
    <button class="relative block w-full aspect-video cursor-pointer" tabindex="0" role="button">
      <iframe width="420" height="315" src="https://www.youtube.com/embed/xIxbKHQFTKM?si=qXvZELVj1HPWRnlM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </button>
  </div>

  <div class="p-6 space-y-4">
    <div class="flex items-center space-x-4">
      <button class="flex items-center space-x-1 text-sm font-medium text-gray-800">
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"></svg>
        <span>{rating}</span>
      </button>
      <span class="text-gray-500 text-xs">{reviews} omdömen</span>
    </div>

    <div class="flex items-center space-x-6">
      <div>
        <h4 class="text-base font-semibold text-gray-800">{lessons}</h4>
        <span class="text-xs text-gray-500">lektioner</span>
      </div>
      <div>
        <div class="flex items-baseline space-x-1">
          <h4 class="text-base font-semibold text-gray-800">{price}</h4>
          <h4 class="text-base text-gray-700">{currency}</h4>
        </div>
        <p class="text-xs text-gray-500">{lessonDuration}</p>
      </div>
    </div>

    <div class="space-y-2">
      <button class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"></svg>
        <span>{buyText}</span>
      </button>
      <button class="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"></svg>
        <span>{messageText}</span>
      </button>
      <button class="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-700 rounded-md font-medium">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"></svg>
        <span>{saveText}</span>
      </button>
    </div>
  </div>
</div> 