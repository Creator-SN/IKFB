<template>
    <div class="ikfb-loading-container">
        <p class="title">{{title}}</p>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            default: 'Loading ...'
        }
    }
}
</script>

<style lang="scss">
.ikfb-loading-container
{
    @include HcenterVcenter;
    
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: linear-gradient(115deg, rgb(211, 255, 215) 0%, rgb(0, 0, 0) 100%), radial-gradient(90% 100% at 50% 0%, rgb(200, 200, 200) 0%, rgb(22, 0, 45) 100%), radial-gradient(100% 100% at 80% 0%, rgb(250, 255, 0) 0%, rgb(36, 0, 0) 100%), radial-gradient(150% 210% at 100% 0%, rgb(112, 255, 0) 0%, rgb(20, 175, 125) 0%, rgb(0, 10, 255) 100%), radial-gradient(100% 100% at 100% 30%, rgb(255, 77, 0) 0%, rgba(0, 200, 255, 1) 100%), linear-gradient(60deg, rgb(255, 0, 0) 0%, rgb(120, 86, 255) 100%);
    background-blend-mode: overlay, overlay, difference, difference, difference, normal;
    background-size: 1000%;
    animation: loading 10s infinite;
    animation-direction: alternate;

    .title
    {
        width: 80%;
        font-size: 12px;
        font-weight: bold;
        color: whitesmoke;
        text-align: center;
        user-select: none;
    }

    @keyframes loading
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