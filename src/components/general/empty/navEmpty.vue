<template>
    <div
        class="nav-empty-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <img
            draggable="false"
            class="empty-arrowhead"
            src="@/assets/empty/guide_arrowhead.svg"
            alt=""
        >
        <div class="nec-d1">
            <div class="nec-icon-block">
                <i
                    class="ms-Icon ms-Icon--ViewListGroup"
                    style="color: rgba(172, 84, 206, 1);"
                ></i>
                <i
                    class="ms-Icon ms-Icon--Dictionary"
                    style="color: rgba(213, 99, 70, 1);"
                ></i>
            </div>
            <p class="nec-content">{{local('No any Content')}}</p>
            <p class="nec-content">{{local('Click + to Add New Group & Partition')}}</p>
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
.nav-empty-container {
    @include HcenterVcenter;

    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    user-select: none;
    overflow: hidden;

    &.dark {
        .empty-arrowhead {
            filter: invert(100%);
            opacity: 1;
        }

        .nec-d1 {
            color: whitesmoke;
        }
    }

    .empty-arrowhead {
        position: absolute;
        left: 35px;
        bottom: 5px;
        width: auto;
        height: 45%;
        max-height: 200px;
        opacity: 0.5;
    }

    .nec-d1 {
        @include HcenterVcenterC;

        position: relative;
        margin-bottom: 95px;
        opacity: 0.3;

        .nec-icon-block {
            margin: 5px;
            font-size: 36px;

            i {
                margin: 0px 15px;
            }
        }

        .nec-content {
            font-size: 12px;
        }
    }
}
</style>