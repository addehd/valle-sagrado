<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/utils';
    
    export let data;
    
    let searchTerm = $page.url.searchParams.get('q') || '';
    let searchField = $page.url.searchParams.get('field') || 'ruc';
    let isLoading = false;
    
    const searchFields = [
        { value: 'ruc', label: 'RUC' },
        { value: 'departamento', label: 'Departamento' },
        { value: 'distrito', label: 'Distrito' },
        { value: 'ubigeo', label: 'Ubigeo' }
    ];

    // debounced search function
    const debouncedSearch = debounce((term: string, field: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('q', term);
        url.searchParams.set('field', field);
        goto(url.toString(), { replaceState: true });
    }, 300);

    // watch for changes in search term or field
    $: if (searchTerm !== undefined || searchField !== undefined) {
        isLoading = true;
        debouncedSearch(searchTerm, searchField);
    }

    // watch for data changes to update loading state
    $: if (data) {
        isLoading = false;
    }
</script>

<div class="container mx-auto p-4 text-test-500">
    <div class="mb-6">
        <h1 class="text-2xl font-bold mb-4">Búsqueda de RUC</h1>
        
        <div class="flex gap-4 items-end">
            <div class="flex-1">
                <label for="searchField" class="block text-sm font-medium text-gray-700 mb-1">Buscar por</label>
                <select 
                    id="searchField"
                    bind:value={searchField}
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {#each searchFields as field}
                        <option value={field.value}>{field.label}</option>
                    {/each}
                </select>
            </div>
            
            <div class="flex-1">
                <label for="searchTerm" class="block text-sm font-medium text-gray-700 mb-1">Término de búsqueda</label>
                <div class="relative">
                    <input
                        type="text"
                        id="searchTerm"
                        bind:value={searchTerm}
                        placeholder="Ingrese término de búsqueda..."
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {#if isLoading}
                        <div class="absolute right-3 top-1/2 -translate-y-1/2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    {#if data.results && data.results.length > 0}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUC</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distrito</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each data.results as result}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.ruc}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.estado}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.condicion}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.departamento}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.provincia}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.distrito}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else if searchTerm}
        <p class="text-gray-500 text-center py-4">no se encontraron resultados</p>
    {/if}
</div>
