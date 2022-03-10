<template>
    <div
        v-show="thisValue"
        class="web-window-base-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="web-window-base">
            <div class="title-bar">
                <p style="margin-left: 10px; user-select: none;">{{title}}</p>
                <button
                    class="control-btn shut-down"
                    @click="close"
                >
                    <i class="ms-Icon ms-Icon--Cancel"></i>
                </button>
            </div>
            <div class="web-window-content-block">
                <div class="w-row overflow">
                    <slot name="content">

                    </slot>
                </div>
            </div>
            <div class="web-window-control-block">
                <slot name="control">
                    <fv-button></fv-button>
                </slot>
            </div>
        </div>
    </div>
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
    methods: {
        close() {
            this.thisValue = false;
        },
    },
};
</script>

<style lang="scss">
.web-window-base-container {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    padding: 15px;
    background: rgba(250, 250, 250, 0.3);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 10;

    &.dark {
        background: rgba(56, 56, 56, 0.3);

        .web-window-base {
            background: rgba(45, 45, 45, 1);
            color: whitesmoke;

            .title-bar {
                .control-btn {
                    color: whitesmoke;

                    &.shut-down {
                        &:hover {
                            color: whitesmoke;
                        }
                    }

                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }

                    &:active {
                        background: rgba(255, 255, 255, 0.2);
                    }
                }
            }
        }
    }

    .web-window-base {
        position: relative;
        min-width: 350px;
        width: 80%;
        height: 100%;
        max-height: 100%;
        background: white;
        color: rgba(95, 95, 95, 1);
        border: rgba(0, 0, 0, 0.1) solid thin;
        border-radius: 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        overflow: hidden;

        .title-bar {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            min-height: 30px;
            height: 30px;
            font-size: 13px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            z-index: 2;

            .control-btn {
                position: relative;
                width: 46px;
                height: 100%;
                border: thin;
                background: transparent;
                font-size: 12px;
                color: rgba(56, 56, 56, 1);
                outline: none;
                display: flex;
                justify-content: center;
                align-items: center;

                &.shut-down {
                    &:hover {
                        background: rgba(214, 33, 33, 0.973);
                        color: whitesmoke;
                    }

                    &:active {
                        background: rgba(247, 88, 88, 0.979);
                    }
                }

                &:hover {
                    background: rgba(0, 0, 0, 0.1);
                }

                &:active {
                    background: rgba(0, 0, 0, 0.2);
                }
            }
        }

        .web-window-content-block {
            position: relative;
            width: 100%;
            flex: 1;
            flex-shrink: 0;
            padding: 40px 0px;
            overflow: auto;
        }

        .web-window-control-block {
            position: relative;
            width: 100%;
            height: 50px;
            padding: 15px;
            box-sizing: border-box;
            display: flex;
            justify-content: flex-end;
        }

        .w-row {
            position: relative;
            width: 100%;
            flex: 1;
            flex-shrink: 0;
            padding: 40px 0px;
            overflow: hidden;

            &.overflow {
                overflow-y: auto;
            }

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

            .w-p-row {
                position: relative;
                width: 100%;
                padding: 0px 15px;
                flex-wrap: wrap;
                display: flex;
                align-items: center;
            }

            .w-title {
                font-size: 13.8px;
                user-select: none;
            }
        }
    }
}
</style>