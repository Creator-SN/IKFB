<template>
    <div
        class="item-list-empty-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="nec-d1">
            <div class="nec-icon-block">
                <img
                    draggable="false"
                    class="empty-emo"
                    src="@/assets/empty/empty_emo.svg"
                    alt=""
                >
            </div>
            <p class="nec-content">{{local('No any Content')}}</p>
            <p class="nec-content sec">{{local('Click + to Add New Item or Drag a PDF File to the Window')}}</p>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
    computed: {
        ...mapState({
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
    },
};
</script>

<style lang="scss">
.item-list-empty-container {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    user-select: none;
    overflow: hidden;

    &.dark {
        .nec-d1 {
            color: whitesmoke;
        }
    }

    .nec-d1 {
        @include HcenterVcenterC;

        position: relative;
        opacity: 0.3;

        .empty-emo {
            position: relative;
            width: 200px;
            height: auto;
            margin-bottom: 25px;
            
            animation: cute-emo 5s infinite ease-in-out;
        }

        .nec-content {
            font-size: 24px;
            line-height: 1.5;

            &.sec
            {
                font-size: 16px;
            }
        }
    }

    @keyframes cute-emo {
        0% {
            transform: scaleY(1);
            transform-origin: 50% 100%;
        }

        10% {
            transform: scaleY(0.8);
            transform-origin: 50% 100%;
        }

        20% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
        }

        40% {
            transform: scaleY(1.1);
            transform-origin: 50% 100%;
        }

        60% {
            transform: scaleY(0.8);
            transform-origin: 50% 100%;
        }

        80% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
            transform: rotateY(0deg);
        }

        80% {
            transform: scaleY(0.9);
            transform-origin: 50% 100%;
            transform: rotateX(30deg);
        }

        90% {
            transform: rotateX(-30deg);
            transform-origin: 50% 100%;
        }

        100% {
            transform: scaleY(1);
            transform-origin: 50% 100%;
        }
    }
}
</style>