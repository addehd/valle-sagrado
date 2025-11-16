<div class="mt-8 flex flex-wrap gap-8 md:gap-16 justify-center">
    <a 
        href="/danny/om-mig" 
        class="text-white font-semibold menu-link">
        Om Mig 
    </a>
    <a 
        href="/danny/about-me" 
        class="text-white font-semibold menu-link">
        About Me 
    </a>
    <a 
        href="/danny/min-filosofi" 
        class="text-white font-semibold menu-link">
        Min Filosofi →
    </a>
</div>

<style>
    .menu-link {
        position: relative;
        padding-bottom: 4px;
    }
    .menu-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: rgb(250, 204, 21);
        transition: width 0.3s ease;
    }
    .menu-link:hover::after {
        width: 120%;
        left: -10%;
    }
</style>

