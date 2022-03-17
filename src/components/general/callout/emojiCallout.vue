<template>
    <callout-base
        :show.sync="show"
        :mobileMode="mobileMode"
        :title="'Emoji'"
        :theme="theme"
        :popperClass="['ikfb-emoji-callout']"
    >
        <template v-slot:trigger>
            <p class="ikfb-emoji-callout-content">{{value}}</p>
        </template>

        <template v-slot:header="x">
            <div class="ikfb-emoji-banner">
                <p style="font-size: 13.8px">{{ x.title }}</p>
                <fv-button
                    :theme="theme"
                    @click="insertRandom"
                >Random</fv-button>
            </div>
        </template>
        <template v-slot:content>
            <fv-infinite-scroll-view
                :value="show ? emoji_list : []"
                :batchSize="2"
                style="width: 100%; height: 100%;"
            >
                <template v-slot:default="x">
                    <div
                        class="ikfb-emoji-list"
                        v-for="(group, index) in x.dynamicValue"
                        :key="`type:${index}`"
                    >
                        <p class="title">{{ group.name }}</p>
                        <div class="ikfb-emoji-group">
                            <i
                                v-for="(item, i) in group.emojis"
                                :key="i"
                                class="emoji-item"
                                v-html="item"
                                @click="insertEmoji(item)"
                            ></i>
                        </div>
                    </div>
                </template>
            </fv-infinite-scroll-view>
        </template>
    </callout-base>
</template>

<script>
import emoji_list from "@/js/emojiList.js";
import calloutBase from "./calloutBase.vue";

export default {
    components: {
        calloutBase,
    },
    props: {
        value: {
            default: "",
        },
        mobileMode: {
            default: false,
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            emoji_list: emoji_list,
            show: false,
        };
    },
    watch: {},
    methods: {
        getTitle(name) {
            return name;
        },
        insertEmoji(emoji) {
            this.$emit("insert-emoji", emoji);
        },
        insertRandom() {
            let i = (Math.random() * (this.emoji_list.length - 1)).toFixed(0);
            let j = (
                Math.random() *
                (this.emoji_list[i].emojis.length - 1)
            ).toFixed(0);
            this.$emit("insert-emoji", this.emoji_list[i].emojis[j]);
        },
    },
};
</script>

<style lang="scss">
.ikfb-emoji-callout-content {
    position: relative;
    padding: 2px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;

    &:hover {
        background: rgba(200, 200, 200, 0.3);
    }

    &:active {
        background: rgba(200, 200, 200, 0.6);
    }
}

.ikfb-emoji-callout {
    .ikfb-emoji-banner {
        position: relative;
        width: 100%;
        height: 35px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    div.main {
        position: relative;
        width: 300px;
        height: 500px;
        max-height: 100%;
        flex: 1;
        padding: 5px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;

        .ikfb-emoji-list {
            position: relative;
            width: 100%;
            height: auto;

            .title {
                font-size: 12px;
            }

            .ikfb-emoji-group {
                position: relative;
                width: 100%;
                height: auto;
                display: flex;
                flex-wrap: wrap;

                .emoji-item {
                    position: relative;
                    width: 35px;
                    height: 35px;
                    padding: 1px;
                    border-radius: 3px;
                    font-size: 20px;
                    font-style: normal;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    user-select: none;
                    cursor: default;

                    &:hover {
                        background: rgba(200, 200, 200, 0.6);
                    }
                }
            }
        }
    }
}

.ikfb-c-b-m-banner {
    .ikfb-emoji-banner {
        position: relative;
        width: 50%;
        height: 35px;
        padding: 0px 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
