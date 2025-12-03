<script lang="ts">
	import LoginFormFields from './LoginFormFields.svelte';
</script>

<section class="bg-[url('/images/valle.jpg')] bg-no-repeat bg-cover bg-center bg-gray-900/70 bg-blend-multiply">
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen pt:mt-0">
      <!-- <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-white">
          <img class="mr-2 w-20 " src="/images/sun.svg" alt="logo">
      </a> -->
      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-900">
          <div class="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white">
                Logga in
              </h1>
              <LoginFormFields />
          </div>
      </div>
  </div>
</section>
