<template>
<div v-show="progress > 0 && progress <= 100" class="ikfb-global-progress-bar">
    <fv-progress-bar :value="progress" background="transparent" foreground="rgba(252, 194, 0, 1)" style="width: 100%;"></fv-progress-bar>
</div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            progress: (state) => state.progress,
        })
    }
}
</script>

<style lang="scss">
.ikfb-global-progress-bar
{
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    z-index: 2;
}
</style>