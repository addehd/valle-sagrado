<div class="mt-2 mb-11 flex flex-wrap gap-8 md:gap-16 justify-center">
    <a href="/pt-i-malmo" class="text-white font-semibold menu-link"> Om Mig </a>
    <a href="/coaching" class="text-white font-semibold menu-link"> Coaching </a>
    <a href="/paket" class="text-white font-semibold menu-link"> Paket → </a>
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

