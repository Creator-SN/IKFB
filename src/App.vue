<template>
    <div id="app">
        <title-bar></title-bar>
        <div class="global-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import titleBar from '@/components/general/titleBar.vue';

export default {
    name: "App",
    components: {
        titleBar
    }
};
</script>

<style lang="scss">
html {
    background: transparent;
}
#app {
    position: fixed;
    width: 100%;
    height: 100%;
    background: transparent;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .global-container
    {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1;
    }
}
</style>
