<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import JSZip from 'jszip';
  import type { PageData, ActionData } from './$types';
  import type { ZipProcessingStatus, ProcessedReceiptFile } from '$lib/types';

  export let data: PageData;
  export let form: ActionData;

  let dragOver = false;
  let isProcessing = false;
  let processingStatus: ZipProcessingStatus | null = null;
  let processedFiles: ProcessedReceiptFile[] = [];
  let error: string | null = null;
  let success: string | null = null;

  // File input reference and form
  let fileInput: HTMLInputElement;
  let uploadForm: HTMLFormElement;

  // Reactive statements
  $: receipts = data.receipts || [];
  $: if (form?.error) {
    error = form.error;
    success = null;
  } else if (form?.success) {
    success = form.message || 'Receipt processed successfully!';
    error = null;
    // Refresh the page to show new receipt
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  // Handle drag and drop
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }

  async function processFiles(files: FileList) {
    error = null;
    success = null;
    processedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.name.toLowerCase().endsWith('.zip')) {
        await processZipFile(file);
      } else if (isValidReceiptFile(file)) {
        await uploadSingleFile(file);
      } else {
        processedFiles = [...processedFiles, {
          file_name: file.name,
          file_type: file.type,
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, PDF, and ZIP files are supported.'
        }];
      }
    }
  }

  async function processZipFile(zipFile: File) {
    try {
      isProcessing = true;
      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.keys(zip.files).filter(name => 
        !zip.files[name].dir && isValidReceiptFileName(name)
      );

      processingStatus = {
        total_files: files.length,
        processed_files: 0,
        successful_files: 0,
        failed_files: 0,
        progress_percentage: 0
      };

      for (const fileName of files) {
        try {
          processingStatus.current_file = fileName;
          
          const fileData = await zip.files[fileName].async('blob');
          const file = new File([fileData], fileName, { 
            type: getFileTypeFromName(fileName) 
          });
          
          await uploadSingleFile(file);
          
          processingStatus.processed_files++;
          processingStatus.successful_files++;
          processingStatus.progress_percentage = 
            (processingStatus.processed_files / processingStatus.total_files) * 100;
          
        } catch (fileError) {
          console.error(`Error processing ${fileName}:`, fileError);
          processedFiles = [...processedFiles, {
            file_name: fileName,
            file_type: getFileTypeFromName(fileName),
            success: false,
            error: fileError instanceof Error ? fileError.message : 'Processing failed'
          }];
          
          processingStatus.processed_files++;
          processingStatus.failed_files++;
          processingStatus.progress_percentage = 
            (processingStatus.processed_files / processingStatus.total_files) * 100;
        }
      }
      
    } catch (zipError) {
      console.error('ZIP processing error:', zipError);
      error = `Failed to process ZIP file: ${zipError instanceof Error ? zipError.message : 'Unknown error'}`;
    } finally {
      isProcessing = false;
      processingStatus = null;
    }
  }

  async function uploadSingleFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a FormData and submit it programmatically
      const formData = new FormData();
      formData.append('file', file);
      
      // Set the file input value and submit the form
      if (fileInput && uploadForm) {
        // Create a temporary DataTransfer to set the files
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        
        // Submit the form
        uploadForm.requestSubmit();
        
        // For now, we'll resolve immediately
        // In a real implementation, you might want to track the submission
        setTimeout(() => {
          resolve();
        }, 100);
      } else {
        reject(new Error('Form elements not available'));
      }
    });
  }

  function isValidReceiptFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    return validTypes.includes(file.type);
  }

  function isValidReceiptFileName(fileName: string): boolean {
    const ext = fileName.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'pdf'].includes(ext || '');
  }

  function getFileTypeFromName(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  function clearMessages() {
    error = null;
    success = null;
  }

  function formatCurrency(amount: number | undefined, currency = 'USD'): string {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }
</script>

<svelte:head>
  <title>Receipt Processing - Financial Management</title>
  <meta name="description" content="Upload and process your receipts with AI-powered data extraction" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Receipt Processing</h1>
    <p class="text-gray-600">Upload receipt images or ZIP files for automatic data extraction</p>
  </div>

  <!-- Upload Section -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Upload Receipts</h2>
    
    <!-- Form for single file upload -->
    <form 
      bind:this={uploadForm}
      method="POST" 
      action="?/uploadReceipt" 
      enctype="multipart/form-data"
      use:enhance={({ formData, cancel }) => {
        isProcessing = true;
        clearMessages();
        
        return async ({ result, update }) => {
          isProcessing = false;
          
          if (result.type === 'success') {
            success = result.data?.message || 'Receipt processed successfully!';
            error = null;
            
            // Log extracted text for debugging
            if (result.data && typeof result.data === 'object' && 'extracted_text' in result.data) {
              console.log('Extracted text:', result.data.extracted_text);
            }
            if (result.data && typeof result.data === 'object' && 'processed_data' in result.data) {
              console.log('Processed data:', result.data.processed_data);
            }
            
            // Clear the file input
            if (fileInput) fileInput.value = '';
          } else if (result.type === 'failure') {
            const data = result.data as any;
            const errorMessage = data?.error || 'Upload failed';
            const errorDetails = data?.details || '';
            error = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
            success = null;
            
            console.error('Upload failed:', result.data);
          }
          
          await update({ reset: false });
        };
      }}
    >
      <!-- Drag and Drop Area -->
      <div 
        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 {dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
        role="button"
        tabindex="0"
        on:click={() => fileInput?.click()}
        on:keydown={(e) => e.key === 'Enter' && fileInput?.click()}
      >
        <div class="space-y-4">
          <div class="flex justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <div>
            <p class="text-lg text-gray-600 mb-2">
              Drop your files here or 
              <span class="text-blue-600 font-medium cursor-pointer hover:text-blue-700">browse</span>
            </p>
            <p class="text-sm text-gray-500">
              Supports: JPEG, PNG, PDF files and ZIP archives
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        </div>

        <input
          bind:this={fileInput}
          type="file"
          name="file"
          accept=".jpg,.jpeg,.png,.pdf,.zip"
          multiple
          class="hidden"
          on:change={handleFileInput}
        />
      </div>

      <button 
        type="submit" 
        disabled={isProcessing}
        class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : 'Upload Receipt'}
      </button>
    </form>
  </div>

  <!-- Messages -->
  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="mt-1 text-sm text-red-700">{error}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            on:click={clearMessages}
            class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
            aria-label="Close error message"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if success}
    <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Success</h3>
          <p class="mt-1 text-sm text-green-700">{success}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            on:click={clearMessages}
            class="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
            aria-label="Close success message"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Processing Status -->
  {#if processingStatus}
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-blue-800">Processing ZIP File</h3>
        <span class="text-sm text-blue-600">
          {processingStatus.processed_files} / {processingStatus.total_files} files
        </span>
      </div>
      
      <div class="w-full bg-blue-200 rounded-full h-2 mb-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style="width: {processingStatus.progress_percentage}%"
        ></div>
      </div>
      
      {#if processingStatus.current_file}
        <p class="text-xs text-blue-700">Processing: {processingStatus.current_file}</p>
      {/if}
      
      <div class="flex justify-between text-xs text-blue-600 mt-2">
        <span>✅ {processingStatus.successful_files} successful</span>
        <span>❌ {processingStatus.failed_files} failed</span>
      </div>
    </div>
  {/if}

  <!-- Processed Files Results -->
  {#if processedFiles.length > 0}
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Processing Results</h3>
      <div class="space-y-2">
        {#each processedFiles as file}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                {#if file.success}
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                {:else}
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{file.file_name}</p>
                {#if file.error}
                  <p class="text-xs text-red-600">{file.error}</p>
                {/if}
              </div>
            </div>
            <span class="text-xs text-gray-500 uppercase">{file.file_type}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Receipts Gallery -->
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Your Receipts</h2>
      <div class="text-sm text-gray-500">
        {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
      </div>
    </div>

    {#if receipts.length === 0}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
        <p class="mt-1 text-sm text-gray-500">Upload your first receipt to get started.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each receipts as receipt}
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900 truncate">
                  {receipt.merchant || receipt.file_name || 'Unknown Receipt'}
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                  {formatDate(receipt.date || receipt.created_at)}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <!-- Status indicator -->
                <div class="flex-shrink-0">
                  {#if receipt.processing_status === 'completed'}
                    <div class="w-2 h-2 bg-green-500 rounded-full" title="Processed"></div>
                  {:else if receipt.processing_status === 'processing'}
                    <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Processing"></div>
                  {:else if receipt.processing_status === 'failed'}
                    <div class="w-2 h-2 bg-red-500 rounded-full" title="Failed"></div>
                  {:else}
                    <div class="w-2 h-2 bg-gray-400 rounded-full" title="Pending"></div>
                  {/if}
                </div>
                <!-- Delete button -->
                <form method="POST" action="?/deleteReceipt" class="inline">
                  <input type="hidden" name="receiptId" value={receipt.id} />
                  <button 
                    type="submit" 
                    class="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete receipt"
                    aria-label="Delete receipt"
                    on:click={(e) => {
                      if (!confirm('Are you sure you want to delete this receipt?')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            <div class="space-y-2">
              <!-- Basic Fields -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Total:</span>
                <span class="font-medium text-gray-900">
                  {formatCurrency(receipt.total, receipt.currency)}
                </span>
              </div>
              
              {#if receipt.processed_data?.subtotal}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Subtotal:</span>
                  <span class="text-gray-700">
                    {formatCurrency(receipt.processed_data.subtotal, receipt.currency)}
                  </span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.tax}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Tax:</span>
                  <span class="text-gray-700">
                    {formatCurrency(receipt.processed_data.tax, receipt.currency)}
                  </span>
                </div>
              {/if}
              
              <!-- Swedish Invoice Fields -->
              {#if receipt.processed_data?.invoice_number}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Invoice #:</span>
                  <span class="text-gray-700">{receipt.processed_data.invoice_number}</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.seller_vat_number}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">VAT Number:</span>
                  <span class="text-gray-700">{receipt.processed_data.seller_vat_number}</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.vat_rate}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">VAT Rate:</span>
                  <span class="text-gray-700">{receipt.processed_data.vat_rate}%</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.vat_amount}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">VAT Amount:</span>
                  <span class="text-gray-700">
                    {formatCurrency(receipt.processed_data.vat_amount, receipt.currency)}
                  </span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.buyer_name}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Buyer:</span>
                  <span class="text-gray-700">{receipt.processed_data.buyer_name}</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.delivery_date}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Delivery:</span>
                  <span class="text-gray-700">{formatDate(receipt.processed_data.delivery_date)}</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.payment_due_date}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Due Date:</span>
                  <span class="text-gray-700">{formatDate(receipt.processed_data.payment_due_date)}</span>
                </div>
              {/if}
              
              {#if receipt.processed_data?.unit_price_excl_vat}
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Unit Price (excl. VAT):</span>
                  <span class="text-gray-700">
                    {formatCurrency(receipt.processed_data.unit_price_excl_vat, receipt.currency)}
                  </span>
                </div>
              {/if}
              
              <!-- Address Information -->
              {#if receipt.processed_data?.address}
                <div class="text-xs">
                  <span class="text-gray-500">Address:</span>
                  <div class="text-gray-700 mt-1">{receipt.processed_data.address}</div>
                </div>
              {:else if receipt.processed_data?.seller_address}
                <div class="text-xs">
                  <span class="text-gray-500">Seller Address:</span>
                  <div class="text-gray-700 mt-1">{receipt.processed_data.seller_address}</div>
                </div>
              {/if}
              
              {#if receipt.processed_data?.buyer_address}
                <div class="text-xs">
                  <span class="text-gray-500">Buyer Address:</span>
                  <div class="text-gray-700 mt-1">{receipt.processed_data.buyer_address}</div>
                </div>
              {/if}
              
              <!-- Items -->
              {#if receipt.processed_data?.items && receipt.processed_data.items.length > 0}
                <div class="text-xs">
                  <span class="text-gray-500">Items ({receipt.processed_data.items.length}):</span>
                  <div class="mt-1 space-y-1">
                    {#each receipt.processed_data.items as item}
                      <div class="text-gray-700 flex justify-between">
                        <span class="truncate">{item.name}</span>
                        <span class="ml-2 flex-shrink-0">
                          {#if item.quantity && item.price}
                            {item.quantity}x {formatCurrency(item.price, receipt.currency)}
                          {:else if item.price}
                            {formatCurrency(item.price, receipt.currency)}
                          {/if}
                        </span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <!-- Confidence Score -->
              {#if receipt.processed_data?.confidence_score}
                <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                  <span class="text-gray-500">Confidence:</span>
                  <span class="text-gray-700">
                    {Math.round(receipt.processed_data.confidence_score * 100)}%
                  </span>
                </div>
              {/if}
            </div>

            {#if receipt.error_message}
              <div class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                Error: {receipt.error_message}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    min-height: calc(100vh - 4rem);
  }
</style> 