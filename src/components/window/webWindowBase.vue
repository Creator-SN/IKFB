<template>
    <fv-web-window
        v-model="thisValue"
        :title="title"
        :theme="theme"
        class="web-window-base"
    >
        <div class="w-row">
            <slot name="content">

            </slot>
        </div>
        <div class="w-row control">
            <slot name="control">
                <fv-button></fv-button>
            </slot>

        </div>
    </fv-web-window>
</template>

<script>
export default {
    props: {
        value: {
            default: true,
        },
        title: {
            default: "Title",
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            thisValue: this.value,
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit("input", val);
        },
    },
};
</script>

<style lang="scss">
.web-window-base {
    min-width: 350px;
    width: 50%;
    height: auto;

    .w-row {
        position: relative;
        width: 100%;
        flex: 1;
        padding: 40px 0px;
        overflow: hidden;

        &.control {
            position: relative;
            width: 100%;
            height: 50px;
            padding: 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-end;
        }

        .w-p-block {
            position: relative;
            width: 100%;
            height: auto;
            padding: 15px;
            box-sizing: border-box;
            line-height: 3;
            display: flex;
            flex-direction: column;
        }

        .w-title {
            font-size: 13.8px;
            user-select: none;
        }
    }
}
</style>