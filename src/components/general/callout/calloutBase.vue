<template>
    <div
        class="ikfb-callout-base-container"
        :class="[{ dark: theme === 'dark' }]"
    >
        <fv-callout
            v-if="!mobileMode"
            :visible.sync="thisShow"
            :lockScroll="true"
            :position="'bottomCenter'"
            :disabled="mobileMode"
            :beak="12"
            :space="0"
            :theme="theme"
            :popperClass="popperClass"
        >
            <slot
                name="trigger"
                :show="false"
            ></slot>
            <header>
                <slot
                    name="header"
                    :title="title"
                >
                    <p style="font-size: 13.8px">{{ title }}</p>
                </slot>
            </header>
            <main>
                <slot
                    name="content"
                    index="1"
                ></slot>
            </main>
        </fv-callout>

        <div v-if="mobileMode">
            <slot
                name="trigger"
                :show="triggerShow"
            ></slot>
            <fv-drawer v-model="thisShow" class="ikfb-callout-base-mobile-container" length="calc(100% - 50px)">
                <div class="ikfb-c-b-m-banner">
                    <slot
                        name="header"
                        :title="title"
                    >
                        <p style="width: 50px"></p>
                        <p class="ikfb-c-b-m-title">{{ title }}</p>
                    </slot>
                    <p
                        class="ikfb-c-b-m-close"
                        @click="thisShow = false"
                    >Cancel</p>
                </div>
                <div
                    class="ikfb-c-b-m-content-block"
                    :class="popperClass"
                >
                    <div
                        class="main"
                        style="width: 100%; height: 100%;"
                    >
                        <slot
                            name="content"
                            index="2"
                        ></slot>
                    </div>
                </div>
            </fv-drawer>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        popperClass: {
            default: [],
        },
        title: {
            default: 'Title',
        },
        show: {
            default: false,
        },
        mobileMode: {
            default: false,
        },
        theme: {
            default: 'light',
        },
    },
    data() {
        return {
            thisShow: false,
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit('update:show', val);
        },
    },
    methods: {
        triggerShow() {
            this.thisShow = true;
        },
    },
};
</script>

<style lang="scss">
.ikfb-callout-base-container {
    &.dark {
        .ikfb-callout-base-mobile-container {
            background: rgba(36, 36, 36, 0.9);

            .ikfb-c-b-m-banner {
                background: rgba(47, 52, 55, 0.95);
                color: whitesmoke;

                .ikfb-c-b-m-close
                {
                    color: rgba(46, 170, 220, 1);
                }
            }
        }

        * {
            color: whitesmoke;
        }
    }

    .ikfb-callout-base-mobile-container {
        background: rgba(247, 246, 243, 0.9);
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        display: flex;
        flex-direction: column;
        z-index: 9;

        .ikfb-c-b-m-banner {
            position: relative;
            width: 100%;
            height: 45px;
            background: rgba(255, 255, 255, 0.95);
            border-bottom: rgba(200, 200, 200, 0.1) solid thin;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .ikfb-c-b-m-title {
                font-size: 16px;
                user-select: none;
            }

            .ikfb-c-b-m-close {
                width: 60px;
                color: rgba(0, 90, 158, 1);
                text-align: center;
                user-select: none;
                cursor: pointer;
            }
        }

        .ikfb-c-b-m-content-block {
            position: relative;
            width: 100%;
            height: 100%;
            flex: 1;
            padding: 30px 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            overflow: hidden;
        }
    }
}
</style>
