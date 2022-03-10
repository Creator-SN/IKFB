<template>
    <transition name="zoom-in-top">
        <div
            v-show="thisValue"
            class="ikfb-rightMenu"
            :class="[{dark: theme === 'dark'}]"
            :style="{left: posX + 'px', top: posY + 'px', width: rightMenuWidth + 'px'}"
        >
            <slot>
                <div>
                    <span>
                        <p>Selected</p>
                    </span>
                </div>
            </slot>
        </div>
    </transition>
</template>

<script>
export default {
    name: "rightMenu",
    props: {
        value: {
            default: false,
        },
        posX: {
            default: 0,
        },
        posY: {
            default: 0,
        },
        rightMenuWidth: {
            default: 200,
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            thisValue: this.value,
            rightMenuHeight: 0,
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit("input", val);
            if (this.rightMenuHeight == 0) {
                this.rightMenuHeight = this.$el.clientHeight;
                this.$emit("update-height", this.rightMenuHeight);
            }
        },
    },
    mounted() {
        this.rightMenuClearInit();
    },
    methods: {
        rightMenuClearInit() {
            window.addEventListener("click", (event) => {
                let x = event.target;
                if (x && x !== this.$el) this.thisValue = false;
            });
        },
    },
};
</script>

<style lang="scss">
.ikfb-rightMenu {
    position: fixed;
    top: 100%;
    width: 200px;
    height: auto;
    padding: 8px 0px;
    background: rgba(239, 239, 239, 1);
    border-radius: 3px;
    box-sizing: border-box;
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.1), 0px 3px 10px rgba(0, 0, 0, 0.3);
    z-index: 3;

    div {
        padding: 1px 0px;

        span {
            width: calc(100% - 10px);
            margin-left: 5px;
            padding: 8px 10px;
            background: rgba(239, 239, 239, 1);
            font-size: 13px;
            border-radius: 3px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;

            &:hover {
                background: rgba(200, 200, 200, 0.3);
                cursor: pointer;
            }

            &:active {
                background: rgba(200, 200, 200, 0.5);
            }

            p {
                @include nowrap;

                width: 100%;
                margin: 0px;
                padding: 0px 15px;
                font-size: 12px;
                font-weight: 400;
                overflow: hidden;
            }
        }

        hr {
            margin: 8px 15px;
            border: thin;
            border-bottom: rgba(0, 0, 0, 0.1) solid thin;
        }
    }

    &.dark {
        background: rgba(36, 36, 36, 1);
        box-shadow: 0px 0px 0px rgba(36, 36, 36, 0.1),
            0px 3px 10px rgba(36, 36, 36, 0.3);

        div {
            span {
                background: rgba(36, 36, 36, 1);

                &:hover {
                    background: rgba(49, 49, 49, 1);
                }

                p {
                    color: whitesmoke;
                }
            }

            hr {
                border-bottom: rgba(50, 49, 48, 1) solid thin;
            }
        }
    }
}

.zoom-in-top-enter-active,
.zoom-in-top-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
        opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: center top;
}
.zoom-in-top-enter,
.zoom-in-top-leave-active {
    opacity: 0;
    transform: scaleY(0);
}
</style>