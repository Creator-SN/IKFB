<template>
    <fv-infinite-scroll-view
        :value="visibleValue"
        class="collapse-list-block"
        @init-start="loading = true"
        @init-end="loading = false"
    >
        <template v-slot:default="x">
            <fv-collapse
                v-for="(item, index) in x.dynamicValue"
                v-show="item.show"
                :theme="theme"
                :key="index"
                :title="item.name"
                :content="`${local('Create Time')}: ${item.createDate}`"
                :maxHeight="350"
                :disabled-collapse="edit"
                style="margin: 5px"
                @contextmenu.native="rightClick($event, item)"
            >
                <template v-slot:icon>
                    <div
                        v-show="!edit"
                        class="icon-block"
                    >
                        <p class="index">{{index + 1}}</p>
                        <emoji-callout
                            :value="item.emoji"
                            :theme="theme"
                            @insert-emoji="$emit('insert-emoji', {item: item, emoji: $event})"
                        ></emoji-callout>
                    </div>
                    <div
                        v-show="edit"
                        class="icon-block"
                    >
                        <p class="index">{{index + 1}}</p>
                        <fv-check-box
                            v-model="item.choosen"
                            :borderColor="theme == 'dark' ? 'whitesmoke' : ''"
                            @click="itemChooseClick(item)"
                        ></fv-check-box>
                    </div>
                </template>
                <template v-slot:title="x">
                    <div class="custom-collapse-title">
                        <p
                            class="title-content h"
                            @dblclick="item.pdf ? $emit('open-file', `${item.id}/${item.pdf}.pdf`) : $emit('open-file', `${item.id}`)"
                        >{{ x.title }}</p>
                    </div>
                </template>
                <template v-slot:content="x">
                    <div
                        class="collapse-info"
                        style="display: flex;"
                    >
                        <p style="width: 180px;">{{ x.content }}</p>
                        <fv-button
                            v-if="item.metadata && item.metadata.year"
                            theme="dark"
                            background="rgba(0, 204, 153, 1)"
                            fontSize="12"
                            style="width: 50px; height: 25px; margin: 0px 15px;"
                        >{{item.metadata.year}}</fv-button>
                    </div>
                </template>
                <template v-slot:extension>
                    <fv-tag
                        :value="item.labels"
                        :theme="theme"
                        class="tag-block"
                        style="max-width: 120px; overflow: auto;"
                        @click.native="$emit('label-click', item)"
                    ></fv-tag>
                </template>
                <slot
                    name="row_expand"
                    :item="item"
                >
                </slot>
            </fv-collapse>
            <fv-shimmer
                v-if="loading"
                style="position: relative; width: 100%; height: auto;"
            >
                <div
                    v-for="(item, index) in 2"
                    :key="index"
                    style="margin-top: 5px; display: flex; align-items: center;"
                >
                    <div
                        class="sample"
                        style="width: 30px; height: 30px; margin: 5px; border-radius: 50%;"
                    ></div>
                    <div
                        class="sample"
                        style="width: 80%; flex: 1; margin: 5px;"
                    ></div>
                </div>
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                    <div
                        v-for="(item, index) in 1"
                        :key="index"
                        style="margin-top: 5px; display: flex; align-items: center;"
                    >
                        <div
                            class="sample"
                            style="width: 80%; height: 15px; margin: 5px;"
                            :style="{width: `${100 - index * 10}%`}"
                        ></div>
                    </div>
                </div>
            </fv-shimmer>
            <right-menu
                v-model="show.rightMenu"
                :theme="theme"
                :posX="posX"
                :posY="posY"
                :rightMenuWidth="rightMenuWidth"
                @update-height="rightMenuHeight = $event"
            >
                <slot name="menu">
                </slot>
            </right-menu>
        </template>
    </fv-infinite-scroll-view>
</template>

<script>
import { mapGetters } from "vuex";
import emojiCallout from "@/components/general/callout/emojiCallout.vue";
import rightMenu from "@/components/general/rightMenu.vue";

export default {
    name: "mainList",
    components: {
        emojiCallout,
        rightMenu,
    },
    props: {
        value: {
            type: Array,
            default: () => [],
        },
        filter: {
            default: () => {
                return {
                    key: "any",
                    value: "",
                };
            },
        },
        edit: {
            default: false,
        },
        desc: {
            default: 1,
        },
        sortKey: {
            // name, title, publisher, createDate, year
            default: "",
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
            posX: 0,
            posY: 0,
            rightMenuHeight: 0,
            loading: false,
            show: {
                rightMenu: false,
            },
        };
    },
    watch: {
        value: {
            deep: true,
            handler () {
                this.thisValue = this.value;
                this.valueInit();
            }
        },
        thisValue() {
            this.$emit("input", this.thisValue);
        },
        sortKey() {
            this.sort();
        },
        desc() {
            this.sort();
        },
        edit () {
            if(!this.edit) {
                for(let i = 0; i < this.thisValue.length; i++) {
                    let t = this.thisValue[i];
                    t.choosen = false;
                    this.$set(this.thisValue, i, t);
                }
            }
        },
        filter() {
            this.filterValue();
        },
        "filter.value"() {
            this.filterValue();
        },
    },
    computed: {
        ...mapGetters(["local"]),
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen && this.thisValue[i].show)
                    result.push(this.thisValue[i]);
            }
            return result;
        },
        currentChoosenAll() {
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen != true && this.thisValue[i].show)
                    return false;
            }
            return true;
        },
        currentChoosenNum() {
            let count = 0;
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen && this.thisValue[i].show)
                    count++;
            }
            return count;
        },
        visibleValue() {
            let result = [];
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].show) result.push(this.thisValue[i]);
            }
            return result;
        },
    },
    mounted() {
        this.valueInit();
    },
    methods: {
        valueInit() {
            let val = JSON.parse(JSON.stringify(this.value));
            for (let i = 0; i < val.length; i++) {
                val[i].choosen =
                    val[i].choosen == undefined ? false : val[i].choosen;
                val[i].show = true;
            }
            this.thisValue = val;
            this.filterValue();
        },
        filterValue() {
            let filter = this.filter;
            if (typeof this.filter == "string")
                filter = {
                    key: "any",
                    value: this.filter,
                };
            if (filter.key == undefined || filter.value == undefined) {
                console.warn(this.filter, "Invalid filter.");
                return 0;
            }
            if (filter.key == "any") {
                for (let i = 0; i < this.thisValue.length; i++) {
                    let status = false;
                    let item = this.thisValue[i];
                    for (let it in this.thisValue[i]) {
                        if (typeof item[it] != "string") continue;
                        if (
                            item[it]
                                .toLowerCase()
                                .indexOf(filter.value.toLowerCase()) > -1
                        ) {
                            status = true;
                            break;
                        }
                    }
                    item.show = status;
                    this.$set(this.thisValue, i, item);
                }
            } else {
                for (let i = 0; i < this.thisValue.length; i++) {
                    let item = this.thisValue[i];
                    let status =
                        this.thisValue[i][this.filter.key]
                            .toLowerCase()
                            .indexOf(filter.value.toLowerCase()) > -1;
                    item.show = status;
                    this.$set(this.thisValue, i, item);
                }
            }
            this.$emit("change-value", this.thisValue);
        },
        rightClick(event, item) {
            event.preventDefault();
            this.show.rightMenu = true;
            let bounding = this.$el.getBoundingClientRect();
            let targetPos = {};
            targetPos.x = event.x;
            targetPos.y = event.y;
            if (targetPos.x < bounding.left) targetPos.x = bounding.left;
            if (targetPos.x + this.rightMenuWidth > bounding.right)
                targetPos.x = bounding.right - this.rightMenuWidth;
            if (targetPos.y < bounding.top) targetPos.y = bounding.top;
            if (targetPos.y + this.rightMenuHeight > bounding.bottom)
                targetPos.y = bounding.bottom - this.rightMenuHeight;
            this.posX = targetPos.x;
            this.posY = targetPos.y;

            this.$emit("rightclick", item);
        },
        itemChooseClick(item) {
            let index = this.thisValue.indexOf(item);
            let t = item;
            t.choosen = !t.choosen;
            this.$set(this.thisValue, index, t);
            this.$emit("change-value", this.thisValue);
            this.$emit("choose-items", this.currentChoosen);
        },
        sort() {
            let numKey = ["year"];
            let strKey1 = ["name"];
            let strKey2 = ["title", "publisher"];
            let timeKey1 = ["createDate"];
            if (numKey.find((it) => it == this.sortKey))
                this.thisValue.sort((a, b) => {
                    if (!a.metadata || !a.metadata[this.sortKey])
                        return this.desc * -1;
                    if (!b.metadata || !b.metadata[this.sortKey])
                        return this.desc * 1;
                    return (
                        this.desc *
                        this.sortNum(
                            a.metadata[this.sortKey],
                            b.metadata[this.sortKey]
                        )
                    );
                });
            else if (strKey1.find((it) => it == this.sortKey))
                this.thisValue.sort((a, b) => {
                    if (!a[this.sortKey]) return this.desc * -1;
                    if (!b[this.sortKey]) return this.desc * 1;
                    return (
                        this.desc *
                        this.sortName(a[this.sortKey], b[this.sortKey])
                    );
                });
            else if (strKey2.find((it) => it == this.sortKey))
                this.thisValue.sort((a, b) => {
                    if (!a.metadata || !a.metadata[this.sortKey])
                        return this.desc * -1;
                    if (!b.metadata || !b.metadata[this.sortKey])
                        return this.desc * 1;
                    return (
                        this.desc *
                        this.sortName(
                            a.metadata[this.sortKey],
                            b.metadata[this.sortKey]
                        )
                    );
                });
            else if (timeKey1.find((it) => it == this.sortKey))
                this.thisValue.sort((a, b) => {
                    if (!a[this.sortKey]) return this.desc * -1;
                    if (!b[this.sortKey]) return this.desc * 1;
                    return (
                        this.desc *
                        this.sortTime(a[this.sortKey], b[this.sortKey])
                    );
                });
        },
        sortNum(item1, item2) {
            return parseFloat(item1) < parseFloat(item2) ? 1 : -1;
        },
        sortName(item1, item2) {
            if (!item1) return -1;
            if (!item2) return 1;
            return item1.localeCompare(item2);
        },
        sortTime(item1, item2) {
            return this.$SDate.Compare(
                this.$SDate.Parse(item1),
                this.$SDate.Parse(item2)
            );
        },
    },
};
</script>

<style lang="scss">
.collapse-list-block {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    .icon-block {
        @include HcenterVcenter;

        width: 90px;
        font-size: 18px;

        .index {
            margin-right: 10px;
            text-align: right;
        }
    }

    .custom-collapse-title {
        @include Vcenter;

        width: 100%;
        overflow: hidden;

        .title-content {
            @include nowrap;

            flex: 1;
            font-size: 16px;
            font-weight: bold;

            &.h {
                cursor: pointer;

                &:hover {
                    color: rgba(255, 180, 0, 1);
                }
            }
        }

        .tag-block {
            width: 150px;
            margin-right: 25px;
            overflow-x: auto;
        }
    }
}
</style>