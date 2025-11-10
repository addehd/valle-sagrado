<script>
    import { onMount } from 'svelte';
    
    export let image = '';
    
    let canvas;
    let img;
    let palettes = [];
    let iterations = 0;
    let processedImage = ''; // Track which image we've already processed
    let isProcessing = false; // Prevent multiple simultaneous processing

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    function getMostVaried(bucket, splitBy) {
        var red = [256, 0];
        var green = [256, 0];
        var blue = [256, 0];
        var luma = [256, 0];
        var h = [1, 0];
        var s = [1, 0];
        var l = [1, 0];

        bucket.forEach(function(pixel) {
            if (pixel[0] < red[0]) { red[0] = pixel[0]; }
            if (pixel[0] > red[1]) { red[1] = pixel[0]; }
            if (pixel[1] < green[0]) { green[0] = pixel[1]; }
            if (pixel[1] > green[1]) { green[1] = pixel[1]; }
            if (pixel[2] < blue[0]) { blue[0] = pixel[2]; }
            if (pixel[2] > blue[1]) { blue[1] = pixel[2]; }

            if (pixel.hue < h[0]) { h[0] = pixel.hue; }
            if (pixel.hue > h[1]) { h[1] = pixel.hue; }
            if (pixel.saturation < s[0]) { s[0] = pixel.saturation; }
            if (pixel.saturation > s[1]) { s[1] = pixel.saturation; }
            if (pixel.lightness < l[0]) { l[0] = pixel.lightness; }
            if (pixel.lightness > l[1]) { l[1] = pixel.lightness; }

            if (pixel.luma < luma[0]) { luma[0] = pixel.luma; }
            if (pixel.luma > luma[1]) { luma[1] = pixel.luma; }
        });

        h[0] *= 255;
        h[1] *= 255;
        s[0] *= 255;
        s[1] *= 255;
        l[0] *= 255;
        l[1] *= 255;

        if (typeof splitBy !== "undefined") {
            return splitBy;
        }

        var max = red;
        var orderBy = 0;

        if (blue[1] - blue[0] > max[1] - max[0]) {
            max = blue;
            orderBy = 2;
        }

        if (green[1] - green[0] > max[1] - max[0]) {
            max = green;
            orderBy = 1;
        }

        if (luma[1] - luma[0] > max[1] - max[0]) {
            max = luma;
            orderBy = 'luma';
        }

        if (h[1] - h[0] > max[1] - max[0]) {
            max = h;
            orderBy = 'hue';
        }

        if (s[1] - s[0] > max[1] - max[0]) {
            max = s;
            orderBy = 'saturation';
        }

        if (l[1] - l[0] > max[1] - max[0]) {
            max = l;
            orderBy = 'lightness';
        }

        return orderBy;
    }

    function sortBucket(bucket, splitBy) {
        var axis = getMostVaried(bucket, splitBy);
        return bucket.sort(function(a, b) {
            if (a[axis] < b[axis]) { return -1 }
            if (a[axis] > b[axis]) { return 1 }
            return 0;
        });
    }

    function getAveragePixel(pixels) {
        var average = [0, 0, 0, 0];

        average.luma = 0;
        average.hue = 0;
        average.saturation = 0;
        average.lightness = 0;

        pixels.forEach(function(pixel) {
            average[0] += pixel[0];
            average[1] += pixel[1];
            average[2] += pixel[2];
            average[3] += pixel[3];
            average.luma += pixel.luma;
            average.hue += pixel.hue;
            average.saturation += pixel.saturation;
            average.lightness += pixel.lightness;
        });

        average[0] /= pixels.length;
        average[1] /= pixels.length;
        average[2] /= pixels.length;
        average[3] /= pixels.length;
        average.luma /= pixels.length;
        average.hue /= pixels.length;
        average.saturation /= pixels.length;
        average.lightness /= pixels.length;

        return average;
    }

    function split(buckets, splitBy) {
        if (iterations > 0) {
            var newBuckets = [];
            buckets.forEach(function(bucket) {
                var mid = Math.round(bucket.length / 2);
                bucket = sortBucket(bucket, splitBy);
                newBuckets.push(bucket.slice(0, mid));
                newBuckets.push(bucket.slice(mid));
            });
            iterations--;
            return split(newBuckets, splitBy);
        } else {
            return buckets;
        }
    }

    function getSwatches(buckets) {
        var swatches = [];
        buckets.forEach(function(bucket) {
            swatches.push(getAveragePixel(bucket));
        });
        return swatches;
    }

    function processImage() {
        // Prevent duplicate processing
        if (!image || !img || !canvas || isProcessing || processedImage === image) {
            console.log('Skipping processing:', { 
                hasImage: !!image, 
                hasImg: !!img, 
                hasCanvas: !!canvas, 
                isProcessing,
                alreadyProcessed: processedImage === image 
            });
            return;
        }
        
        isProcessing = true;
        console.log('🎨 Processing image:', image);

        // Create a new image to avoid CORS issues
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        
        tempImg.onload = function() {
            console.log('Image loaded successfully');
            const context = canvas.getContext('2d');
            
            // Optimized: smaller canvas for faster processing
            canvas.width = 200; // Reduced from 400
            canvas.height = canvas.width * tempImg.height / tempImg.width;
            context.drawImage(tempImg, 0, 0, canvas.width, canvas.height);

            // Optimized: batch pixel reading instead of one-by-one
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            var pixels = [];

            // Process pixels in batches (much faster)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                var pixel = [r, g, b, a];
                var hsl = rgbToHsl(r, g, b);
                pixel.luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                pixel.hue = hsl[0];
                pixel.saturation = hsl[1];
                pixel.lightness = hsl[2];
                pixels.push(pixel);
            }

            console.log('Processed pixels:', pixels.length);

            // Create all the palettes like in the working JS
            var buckets = [pixels];
            var buckets1 = buckets.slice(0);
            var buckets2 = buckets.slice(0);
            var buckets3 = buckets.slice(0);
            var buckets4 = buckets.slice(0);
            var buckets5 = buckets.slice(0);

            palettes = [];

            // Auto
            iterations = 3;
            buckets1 = split(buckets1);
            palettes.push({ name: 'Auto', swatches: getSwatches(buckets1), class: '' });

            // // Custom
            // iterations = 2;
            // buckets = split(buckets, 'hue');
            // iterations = 3;
            // buckets = split(buckets, 'luma');
            // palettes.push({ name: 'Custom', swatches: getSwatches(buckets), class: 'custom' });

            // // Hue
            // iterations = 5;
            // buckets3 = split(buckets3, 'hue');
            // palettes.push({ name: 'Hue', swatches: getSwatches(buckets3), class: '' });

            // // Saturation
            // iterations = 5;
            // buckets4 = split(buckets4, 'saturation');
            // palettes.push({ name: 'Saturation', swatches: getSwatches(buckets4), class: '' });

            // // Lightness
            // iterations = 5;
            // buckets5 = split(buckets5, 'lightness');
            // palettes.push({ name: 'Lightness', swatches: getSwatches(buckets5), class: '' });

            // // Luma
            // iterations = 5;
            // buckets2 = split(buckets2, 'luma');
            // palettes.push({ name: 'Luma', swatches: getSwatches(buckets2), class: '' });

            // Convert RGB colors to hex array for database storage
            if (palettes.length > 0) {
                const hexColors = palettes[0].swatches.map(swatch => {
                    const r = Math.round(swatch[0]).toString(16).padStart(2, '0');
                    const g = Math.round(swatch[1]).toString(16).padStart(2, '0');
                    const b = Math.round(swatch[2]).toString(16).padStart(2, '0');
                    return `#${r}${g}${b}`.toUpperCase();
                });
                console.log('🎨 Colors array for database:', JSON.stringify(hexColors));
                console.log('🎨 Copy this for your server data:', hexColors);
            }
            
            // Mark as processed and reset processing flag
            processedImage = image;
            isProcessing = false;
        };

        tempImg.onerror = function() {
            console.error('Failed to load image:', image);
            isProcessing = false; // Reset processing flag on error
        };

        tempImg.src = image;
    }

    // Process when image prop changes (but only once per image)
    $: if (image && image !== processedImage && !isProcessing) {
        // Wait for DOM elements to be ready
        setTimeout(() => {
            if (img && canvas) {
                processImage();
            }
        }, 100);
    }

    onMount(() => {
        console.log('ColorSamples mounted');
        // Process initial image if available
        if (image && img && canvas) {
            processImage();
        }
    });
</script>

<div>
    <canvas bind:this={canvas} class="hidden"></canvas>
    <img bind:this={img} alt="" class="hidden">

    {#if palettes.length > 0}
        {#each palettes as palette}
            <div class="mb-10 mr-l after:table after:clear-both after:content-[''] {palette.class === 'custom' ? 'custom-grid' : ''}">
                {#each palette.swatches as swatch, index}
                    <div class="w-8 h-6 float-left border border-white/20 {index === 0 ? 'rounded-l' : ''} {index === palette.swatches.length - 1 ? 'rounded-r' : ''}" style="background-color: rgba({Math.round(swatch[0])}, {Math.round(swatch[1])}, {Math.round(swatch[2])}, 1)" ></div>
                {/each}
            </div>
        {/each}
    {:else}
        <p class="text-white/70">Loading colors...</p>
    {/if}
</div>

<style>
    /* Custom grid layout for the 'custom' palette - can't be done with Tailwind */
    .custom-grid > :global(:nth-child(8n+1)) {
        clear: left;
    }
</style>