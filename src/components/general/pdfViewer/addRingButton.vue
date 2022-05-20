<template>
    <transition name="add-ring-button">
        <fv-button
            v-show="thisValue"
            class="add-ring-button"
            :border-radius="50"
            :is-box-shadow="true"
            :background="'rgba(247, 191, 100, 1)'"
            :style="{left: `${pos.left}px`, top: `${pos.top}px`}"
            style="position: absolute; width: 40px; height: 40px;"
            @click="$emit('choose-selection', selectionObj)"
        >
            <i class="ms-Icon ms-Icon--SubscriptionAdd"></i>
        </fv-button>
    </transition>
</template>

<script>
export default {
    props: {
        value: {
            default: false,
        },
        parent: {
            default: null,
        },
        selectionObj: {
            default: null,
        },
    },
    data() {
        return {
            thisValue: this.value,
            pos: {
                left: 0,
                top: 0,
            },
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
    mounted() {
        this.eventInit();
    },
    methods: {
        eventInit() {
            window.addEventListener("click", this.refreshPos);
            window.addEventListener("click", this.outsideClickEvent);
        },
        refreshPos(event) {
            if (!this.parent) return;
            const { left, top } = this.parent.getBoundingClientRect();
            this.pos.left = event.x - left + this.parent.scrollLeft + 10;
            this.pos.top = event.y - top + this.parent.scrollTop + 10;
        },
        outsideClickEvent(event) {
            let x = event.target;
            let _self = false;
            while (x && x.tagName && x.tagName.toLowerCase() != "body") {
                if (x == this.$el || [...x.classList].includes("textLayer")) {
                    _self = true;
                    break;
                }
                x = x.parentNode;
            }
            if (!_self) this.thisValue = false;
        },
    },
};
</script>

<style lang="scss">
.add-ring-button {
    transition: all 0.3s;
}

.add-ring-button-enter-active {
    transition: transform 0.3s;
}

.add-ring-button-leave-active {
    transition: transform 0s;
}

.add-ring-button-enter,
.add-ring-button-leave-to {
    transform: scale(0);
}

.add-ring-button-enter-to,
.add-ring-button-leave {
    transform: scale(1);
}
</style>