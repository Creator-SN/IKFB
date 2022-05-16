<template>
    <div
        class="ikfb-templates-grid"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            v-show="item.show"
            v-for="(item, index) in thisValue"
            class="template-block"
            :key="index"
            @contextmenu="rightClick($event, item)"
        >
            <div
                class="content-preview"
                @click="chooseCurrent(item)"
            >
                <fv-shimmer
                    v-if="item.minContent == undefined"
                    :theme="theme"
                    style="position: relative; width: 100%; height: 100%;"
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
                            v-for="(item, index) in 5"
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
                <power-editor
                    v-if="item.minContent != undefined"
                    :value="item.minContent"
                    :placeholder="local('No content here ...')"
                    :editable="false"
                    :theme="theme"
                    :editorOutSideBackground="theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'"
                    :mobileDisplayWidth="0"
                    style="position: relative; width: 100%; min-height: 100%; height: auto;"
                ></power-editor>
            </div>
            <div class="bottom-info">
                <div class="bottom-item-row">
                    <p class="template-icon">{{item.emoji}}</p>
                    <p
                        class="template-title"
                        :title="item.name"
                    >{{item.name}}</p>
                </div>
                <div class="bottom-item-row">
                    <i class="ms-Icon ms-Icon--Clock"></i>
                    <p class="template-date">{{item.createDate}}</p>
                </div>
            </div>
            <span
                class="icon-block icon"
                key="multi-col"
                @click="itemChooseClick(item)"
            >
                <span
                    class="icon"
                    :class="{choose: item.choosen}"
                >
                    <i class="ms-Icon ms-Icon--FullCircleMask ll"></i>
                    <i class="ms-Icon ms-Icon--CircleRing ll"></i>
                    <i class="ms-Icon ms-Icon--Completed ll"></i>
                </span>
            </span>
        </div>
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
    </div>
</template>

<script>
import rightMenu from "@/components/general/rightMenu.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        rightMenu,
    },
    props: {
        value: {
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
        rightMenuWidth: {
            default: 200,
        }
    },
    data() {
        return {
            thisValue: [],
            posX: 0,
            posY: 0,
            rightMenuItem: {},
            rightMenuHeight: 0,
            show: {
                rightMenu: false,
            },
        };
    },
    watch: {
        value() {
            this.loadTemplates();
        },
        show_editor(val) {
            if (!val) this.loadTemplates();
        },
        filter() {
            this.filterValue();
        },
        "filter.value"() {
            this.filterValue();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            templates: (state) => state.data_structure.templates,
            show_editor: (state) => state.editor.show,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.thisValue.length; i++) {
                if (this.thisValue[i].choosen && this.thisValue[i].show)
                    result.push(this.thisValue[i]);
            }
            return result;
        },
    },
    mounted() {
        this.loadTemplates();
        this.filterValue();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            toggleEditor: "toggleEditor",
        }),
        async loadTemplates() {
            this.thisValue = JSON.parse(JSON.stringify(this.value));
            let promises = [];
            for (let el of this.thisValue) {
                el.show = true;
                el.choosen = false;
                this.$set(this.thisValue, this.thisValue.indexOf(el), el);
            }
            for (let el of this.thisValue) {
                let url = path.join(
                    this.data_path[this.data_index],
                    "root/templates",
                    `${el.id}.json`
                );
                ipc.send("read-file", {
                    id: el.id,
                    path: url,
                });
                promises.push(
                    new Promise((resolve) => {
                        ipc.on(`read-file-${el.id}`, (event, data) => {
                            let content = data;
                            try {
                                el.content = JSON.parse(content);
                                el.content.content = el.content.content.slice(
                                    0,
                                    10
                                );
                            } catch (e) {
                                el.content = content.slice(0, 500);
                            }
                            el.minContent = el.content;
                            this.$set(
                                this.thisValue,
                                this.thisValue.indexOf(el),
                                el
                            );
                            resolve(el.id);
                        });
                    })
                );
            }
            return await Promise.all(promises);
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
        itemChooseClick(item) {
            let index = this.thisValue.indexOf(item);
            let t = item;
            t.choosen = !t.choosen;
            this.$set(this.thisValue, index, t);
            this.$emit("change-value", this.thisValue);
            this.$emit("choose-items", this.currentChoosen);
        },
        chooseCurrent(item) {
            for (let i = 0; i < this.thisValue.length; i++) {
                let t = this.thisValue[i];
                t.choosen = false;
                this.$set(this.thisValue, i, t);
            }
            item.choosen = true;
            this.$set(this.thisValue, this.thisValue.indexOf(item), item);
            this.$emit("change-value", this.thisValue);
            this.$emit("item-click", item);
            this.$emit("choose-items", this.currentChoosen);
        },
    },
};
</script>

<style lang="scss">
.ikfb-templates-grid {
    @include FullRelative;

    padding: 15px;
    grid-template-columns: repeat(auto-fill, 200px);
    grid-template-rows: auto;
    column-gap: 30px;
    row-gap: 30px;
    box-sizing: border-box;
    display: grid;
    overflow: auto;

    &.dark {
        .template-block {
            background: rgba(36, 36, 36, 1);
            color: whitesmoke;
            border: rgba(90, 90, 90, 0.1) solid thin;

            .bottom-info {
                color: whitesmoke;

                .template-title {
                    color: whitesmoke;
                }

                .template-date {
                    color: whitesmoke;
                }
            }
        }
    }

    .template-block {
        @include FullRelative;

        height: 300px;
        border: rgba(200, 200, 200, 0.1) solid thin;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1),
            -3px 3px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        &:hover {
            box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2),
                -3px 3px 8px rgba(0, 0, 0, 0.2);
        }

        &:active {
            box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2),
                -3px -3px 8px rgba(0, 0, 0, 0.2);
        }

        .content-preview {
            position: relative;

            flex: 1;
            overflow: hidden;

            .shimmer-container {
                height: 100%;
            }
        }

        .bottom-info {
            position: relative;
            width: 100%;
            height: 60px;
            padding: 0px 10px;
            border-top: rgba(200, 200, 200, 0.1) solid thin;
            box-sizing: border-box;
            line-height: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .bottom-item-row {
                @include Vcenter;

                user-select: none;
            }

            .template-title {
                @include nowrap;

                margin-left: 5px;
                font-size: 12px;
                font-weight: bold;
                color: rgba(50, 49, 48, 1);
            }

            .template-date {
                @include nowrap;

                margin-left: 5px;
                font-size: 12px;
                color: rgba(50, 49, 48, 1);
            }
        }

        .icon-block {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 25px;
            height: 25px;
            background: rgba(200, 200, 200, 0.3);
            border-radius: 50%;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2;

            .icon {
                @include multi-selection;
            }
        }
    }
}
</style>