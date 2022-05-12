<template>
    <div class="ikfb-loading-container" :class="[{dark: theme === 'dark'}]">
        <p class="title">{{title}}</p>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: {
        title: {
            default: "Loading ...",
        }
    },
    computed: {
        ...mapState({
            theme: (state) => state.theme,
        })
    },
};
</script>

<style lang="scss">
.ikfb-loading-container {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: linear-gradient(255deg, #eaeaea, #f5eabc, #f7c2d2, #ffffff);
    background-size: 800% 800%;
    animation: loading 21s ease infinite;

    &.dark {
        background: linear-gradient(
                115deg,
                rgb(211, 255, 215) 0%,
                rgb(0, 0, 0) 100%
            ),
            radial-gradient(
                90% 100% at 50% 0%,
                rgb(200, 200, 200) 0%,
                rgb(22, 0, 45) 100%
            ),
            radial-gradient(
                100% 100% at 80% 0%,
                rgb(250, 255, 0) 0%,
                rgb(36, 0, 0) 100%
            ),
            radial-gradient(
                150% 210% at 100% 0%,
                rgb(112, 255, 0) 0%,
                rgb(20, 175, 125) 0%,
                rgb(0, 10, 255) 100%
            ),
            radial-gradient(
                100% 100% at 100% 30%,
                rgb(255, 77, 0) 0%,
                rgba(0, 200, 255, 1) 100%
            ),
            linear-gradient(60deg, rgb(255, 0, 0) 0%, rgb(120, 86, 255) 100%);
        background-blend-mode: overlay, overlay, difference, difference,
            difference, normal;
        background-size: 1000%;
        animation: loading 10s infinite;
        background: linear-gradient(
                115deg,
                rgb(211, 255, 215) 0%,
                rgb(0, 0, 0) 100%
            ),
            radial-gradient(
                90% 100% at 50% 0%,
                rgb(200, 200, 200) 0%,
                rgb(22, 0, 45) 100%
            ),
            radial-gradient(
                100% 100% at 80% 0%,
                rgb(250, 255, 0) 0%,
                rgb(36, 0, 0) 100%
            ),
            radial-gradient(
                150% 210% at 100% 0%,
                rgb(112, 255, 0) 0%,
                rgb(20, 175, 125) 0%,
                rgb(0, 10, 255) 100%
            ),
            radial-gradient(
                100% 100% at 100% 30%,
                rgb(255, 77, 0) 0%,
                rgba(0, 200, 255, 1) 100%
            ),
            linear-gradient(60deg, rgb(255, 0, 0) 0%, rgb(120, 86, 255) 100%);
        background-blend-mode: overlay, overlay, difference, difference,
            difference, normal;
        background-size: 1000%;
        animation: loading-dark 21s ease infinite;
        animation-direction: alternate;

        .title
        {
            color: whitesmoke;
        }
    }

    .title {
        width: 80%;
        font-size: 12px;
        font-weight: bold;
        color: rgba(50, 49, 48, 1);
        text-align: center;
        user-select: none;
    }

    @keyframes loading {
        0% {
            background-position: 0% 69%;
        }
        50% {
            background-position: 100% 32%;
        }
        100% {
            background-position: 0% 69%;
        }
    }

    @keyframes loading-dark
    {
        0% {
            background-position: 0% 0%;
        }

        to {
            background-position: 100% 100%;
        }
    }
}
</style>