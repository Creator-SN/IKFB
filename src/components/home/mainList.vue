<template>
    <div class="collapse-list-block">
        <fv-collapse
            v-for="(item, index) in thisValue"
            v-show="item.show"
            :theme="theme"
            :key="index"
            :title="item.name"
            :content="`${local('Create Time')}: ${item.createDate}`"
            :maxHeight="350"
            style="margin: 5px"
            @contextmenu.native="rightClick($event, item)"
        >
            <template v-slot:icon>
                <div
                    v-show="!edit"
                    class="icon-block"
                >
                    <p class="index">{{index + 1}}</p>
                    <p
                        :title="item.emoji"
                        style="user-select: none;"
                    >{{ item.emoji }}</p>
                </div>
                <div
                    v-show="edit"
                    class="icon-block"
                >
                    <p class="index">{{index + 1}}</p>
                    <fv-check-box
                        v-model="item.choosen"
                        @click="itemChooseClick(item)"
                    ></fv-check-box>
                </div>
            </template>
            <template v-slot:title="x">
                <div class="custom-collapse-title">
                    <p class="title-content h" @click="item.pdf ? $emit('open-file', `${item.id}/${item.pdf}.pdf`) : $emit('open-file', `${item.id}`)">{{ x.title }}</p>
                    <fv-tag
                        :value="item.labels"
                        :theme="theme"
                        class="tag-block"
                        @click.native="$emit('label-click', item)"
                    ></fv-tag>
                </div>
            </template>
            <slot
                name="row_expand"
                :item="item"
            >
            </slot>
        </fv-collapse>
        <right-menu
            v-model="show.rightMenu"
            :theme="theme"
            :posX="posX"
            :posY="posY"
        >
            <slot name="menu">
            </slot>
        </right-menu>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import rightMenu from "@/components/general/rightMenu.vue";

export default {
    name: "mainList",
    components: {
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
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            thisValue: this.value,
            posX: 0,
            posY: 0,
            show: {
                rightMenu: false,
            },
        };
    },
    watch: {
        value() {
            this.thisValue = this.value;
            this.valueInit();
        },
        thisValue() {
            this.$emit("input", this.thisValue);
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

        width: 200px;
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
                    color: rgba(0, 120, 212, 1);
                    text-decoration: underline;
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