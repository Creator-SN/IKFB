<template>
    <transition :name="show_editor ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="show_editor"
            class="ikfb-editor-container"
            :class="[{ dark: theme == 'dark', fullScreen: fullScreen }]"
        >
            <div class="control-banner">
                <div class="control-left-block">
                    <fv-button
                        v-if="item && item.pages"
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        @click="show.quickNav ^= true"
                    >
                        <i
                            class="ms-Icon"
                            :class="[
                            show.quickNav
                                ? 'ms-Icon--RemoveFromShoppingList'
                                : 'ms-Icon--PageList',
                        ]"
                        ></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        @click="fullScreen ^= true"
                    >
                        <i
                            class="ms-Icon"
                            :class="[
                            fullScreen
                                ? 'ms-Icon--BackToWindow'
                                : 'ms-Icon--FullScreen',
                        ]"
                        ></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        @click="readonly = readonly == true ? false : true"
                    ><i
                            class="ms-Icon"
                            :class="[
                            `ms-Icon--${
                                readonly === true ? 'PageEdit' : 'ReadingMode'
                            }`,
                        ]"
                        ></i></fv-button>
                    <fv-button
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        @click="expandContent = expandContent == true ? false : true"
                    ><i
                            class="ms-Icon"
                            :class="[
                            `ms-Icon--${
                                expandContent === true ? 'StaplingPortraitBookBinding' : 'StaplingLandscapeTwoTop'
                            }`,
                        ]"
                        ></i></fv-button>
                    <fv-button
                        v-show="unsave"
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        background="rgba(0, 204, 153, 1)"
                    >
                        {{ "" }}
                    </fv-button>
                </div>
                <div class="control-right-block">
                    <fv-toggle-switch
                        :title="local('Auto Save')"
                        v-model="auto_save"
                        class="save-btn"
                        :on="local('Turn Off Auto Save')"
                        :off="local('Turn On Auto Save')"
                        :onForeground="theme === 'dark' ? '#fff' : '#000'"
                        :offForeground="theme === 'dark' ? '#fff' : '#000'"
                    >
                    </fv-toggle-switch>
                    <fv-button
                        :theme="theme"
                        :borderRadius="30"
                        class="control-btn"
                        @click="close"
                    >
                        <i class="ms-Icon ms-Icon--Cancel"></i>
                    </fv-button>
                </div>
            </div>
            <div
                v-if="showNav"
                class="nav-banner"
            >
                <fv-Breadcrumb
                    :value="`${item.name}/${target.name}`"
                    :disabled="history.length === 0"
                    :theme="theme"
                    :rootIcon="history.length > 0 ? 'PageLeft' : 'FolderHorizontal'"
                    style="font-size: 12px; white-space: nowrap;"
                    @root-click="back"
                ></fv-Breadcrumb>
            </div>
            <power-editor
                :value="content"
                :placeholder="local('Write something ...')"
                :editable="!readonly"
                :theme="theme"
                :language="language"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'
                "
                :contentMaxWidth="expandContent ? '99999px' : '900px'"
                :mobileDisplayWidth="0"
                :mentionItemAttr="editorMentionItemAttr"
                ref="editor"
                :style="{height: `calc(100% - ${showNav ? 80 : 40}px)`, 'font-size': `${fontSize}px`}"
                style="
                    position: relative;
                    width: 100%;
                    height: calc(100% - 40px);
                    flex: 1;
                "
                @save-json="saveContent"
                @click.native="show.quickNav = false"
            ></power-editor>
            <div
                class="bottom-control"
                :class="[{dark: theme == 'dark'}, {close: !show.bottomControl}]"
            >
                <i
                    class="ms-Icon trigger"
                    :class="[`ms-Icon--${show.bottomControl ? 'ChevronRightMed' : 'ChevronLeftMed'}`]"
                    style="flex: 1;"
                    @click="show.bottomControl ^= true"
                ></i>
                <fv-slider
                    v-show="show.bottomControl"
                    v-model="fontSize"
                    :mininum="12"
                    :maxinum="72"
                    icon="RadioBullet"
                    color="rgba(87, 156, 193, 1)"
                    :showLabel="true"
                    style="width: 150px; margin-right: 15px;"
                >
                    <template slot-scope="prop">
                        <p style="margin: 5px;">{{prop.value}}px</p>
                    </template>
                </fv-slider>
            </div>
            <transition :name="!show.quickNav ? 'move-right-to-left' : 'move-left-to-right'">
                <div
                    v-if="item && item.id"
                    v-show="show.quickNav"
                    class="quick-nav-block"
                    :class="[{dark: theme == 'dark'}]"
                >
                    <div
                        v-for="(page, index) in item.pages"
                        :key="index"
                        class="item"
                        :class="[{choosen: page.id == target.id}]"
                        @click="openEditor(item, page)"
                    >
                        <p>{{page.emoji}}</p>
                        <div class="info-content-block">
                            <p class="highlight">{{page.name}}</p>
                            <p class="sec date">{{page.id}}</p>
                        </div>
                        <p class="sec">{{page.createDate}}</p>
                    </div>
                    <div
                        class="item"
                        @click="show.addItemPage = true"
                    >
                        <i class="ms-Icon ms-Icon--Add"></i>
                        <p style="margin-left: 15px;">{{local("Add Page")}}</p>
                    </div>
                </div>
            </transition>
            <add-item-page
                v-if="item && item.id"
                :show.sync="show.addItemPage"
                :item="item"
            ></add-item-page>
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";

import addItemPage from "@/components/home/addItemPage.vue";

const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        addItemPage,
    },
    data() {
        return {
            content: "",
            readonly: false,
            fontSize: 16,
            fullScreen: false,
            expandContent: false,
            unsave: false,
            auto_save: false,
            editorMentionItemAttr: {
                mentionList: (val) => this.mentionList(val),
                filterFunc: () => {
                    return true;
                },
                chooseItemCallback: () => {
                    console.log("chooseItemCallback");
                },
                mentionClickCallback: (item) => {
                    if (item.type === "item") {
                        this.openFile(
                            item.pdf ? `${item.id}/${item.pdf}.pdf` : item.id
                        );
                    } else if (item.type === "page") {
                        this.openEditor(item.parent, item._page);
                    }
                },
                headerForeground: "rgba(0, 120, 212, 1)",
            },
            show: {
                quickNav: false,
                addItemPage: false,
                bottomControl: false,
            },
            timeout: {
                autoSave: undefined,
            },
        };
    },
    watch: {
        $route() {
            this.unsave = false;
        },
        show_editor() {
            this.unsave = false;
            this.refreshContent();
        },
        target() {
            this.unsave = false;
            this.refreshContent();
            this.$nextTick(() => {
                this.scrollToTop(this.scrollTop);
            });
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            templates: (state) => state.data_structure.templates,
            language: (state) => state.language,
            theme: (state) => state.theme,
            show_editor: (state) => state.editor.show,
            type: (state) => state.editor.type,
            scrollTop: (state) => state.editor.scrollTop,
            history: (state) => state.editor.history,
            item: (state) => state.editor.item,
            items: (state) => state.data_structure.items,
            target: (state) => state.editor.target,
        }),
        ...mapGetters(["local", "ds_db"]),
        mentionList() {
            return (value) => {
                let result = [];
                let rList = [];
                // let rPage = [];
                result.push({
                    key: -1,
                    name: this.local("Item"),
                    type: "header",
                });

                let queryPage =
                    value.split("/").length > 1 ? value.split("/")[1] : "";

                this.items.forEach((el, idx) => {
                    if (
                        el.name.toLowerCase().indexOf(value.toLowerCase()) >
                            -1 ||
                        el.name
                            .toLowerCase()
                            .indexOf(value.split("/")[0].toLowerCase()) > -1
                    ) {
                        rList.push({
                            key: idx,
                            id: el.id,
                            name: `${el.emoji} ${el.name}`,
                            emoji: el.emoji,
                            pdf: el.pdf,
                            type: "item",
                        });

                        if (value.indexOf("/") > -1) {
                            el.pages.forEach((page, pidx) => {
                                if (
                                    page.name
                                        .toLowerCase()
                                        .indexOf(queryPage.toLowerCase()) > -1
                                ) {
                                    rList.push({
                                        key: idx + "-" + pidx,
                                        id: page.id,
                                        name: `${page.emoji}  ${page.name}`,
                                        emoji: page.emoji,
                                        icon: "Go",
                                        iconColor:
                                            this.theme === "light"
                                                ? "rgba(36, 36, 36, 1)"
                                                : "rgba(220, 220, 220, 1)",
                                        parent: el,
                                        _page: page,
                                        type: "page",
                                    });
                                }
                            });
                            rList.push({
                                key: idx + "-divider",
                                name: `-`,
                                type: "divider",
                            });
                        }
                    }
                });
                rList = rList.slice(0, 20);
                result = result.concat(rList);

                return result;
            };
        },
        showNav () {
            return this.type === 'item' && this.item.name && this.target.name;
        }
    },
    mounted() {
        this.ShortCutInit();
        this.TimeoutInit();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            reviseEditor: "reviseEditor",
            toggleEditor: "toggleEditor",
        }),
        TimeoutInit() {
            this.timeout.autoSave = setInterval(this.editorSave, 1000);
        },
        TimeoutDestroy() {
            clearInterval(this.timeout.autoSave);
        },
        ShortCutInit() {
            this.$el.addEventListener("keydown", (event) => {
                if (event.keyCode === 83 && event.ctrlKey) {
                    this.$refs.editor.save();
                    this.unsave = false;
                } else {
                    let filterKey = [16, 17, 18, 20];
                    if (filterKey.indexOf(event.keyCode) < 0) {
                        if (!this.readonly) this.unsave = true;
                    }
                }

                if (event.keyCode === 9) {
                    event.preventDefault();
                    this.$refs.editor.editor.commands.insertContent("    ");
                }
            });
        },
        async refreshContent() {
            if (!this.type || !this.target.id) return;
            let folder =
                this.type === "template" ? "root/templates" : "root/items";
            if (this.type === "item") {
                if (!this.item) return;
                folder = path.join(folder, this.item.id);
            }
            let url = path.join(
                this.data_path[this.data_index],
                folder,
                `${this.target.id}.json`
            );
            ipc.send("read-file", {
                id: "editor",
                path: url,
            });
            let content = await new Promise((resolve) => {
                ipc.on(`read-file-editor`, (event, data) => {
                    resolve(data);
                });
            });
            try {
                this.content = JSON.parse(content);
            } catch (e) {
                this.content = content;
            }
            if (this.content === "") this.$refs.editor.focus();
        },
        editorSave() {
            if (this.auto_save && this.show_editor && this.unsave) {
                this.$refs.editor.save();
            }
        },
        async saveContent(json) {
            if (!this.type || !this.target.id) return;
            let folder =
                this.type === "template" ? "root/templates" : "root/items";
            if (this.type === "item") {
                if (!this.item) return;
                folder = path.join(folder, this.item.id);
            }
            let url = path.join(
                this.data_path[this.data_index],
                folder,
                `${this.target.id}.json`
            );
            ipc.send("output-file", {
                path: url,
                data: JSON.stringify(json),
            });
            await new Promise((resolve) => {
                ipc.on("output-file-callback", () => {
                    resolve(1);
                });
            });
            this.unsave = false;
        },
        openEditor(item, page) {
            if (this.type === "item" && this.item && this.target) {
                this.history.push({
                    type: this.type,
                    item: this.item,
                    page: this.target,
                    scrollTop: this.getScrollTop(),
                });
            }
            this.reviseEditor({
                type: "item",
                item: item,
                target: page,
                scrollTop: 0,
                history: this.history,
            });
        },
        openFile(fileName) {
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                fileName
            );
            ipc.send("open-file", url);
            ipc.on("open-file-callback", (event, data) => {
                console.log(data);
            });
        },
        back() {
            let last = this.history[this.history.length - 1];
            this.history.splice(this.history.length - 1, 1);
            this.reviseEditor({
                type: last.type,
                item: last.item,
                target: last.page,
                scrollTop: last.scrollTop,
                history: this.history,
            });
        },
        scrollToTop (top) {
            let editorContent = this.$el.querySelectorAll(".tip-tap-editor-container")[0];
            console.log(editorContent);
            if(!editorContent) return;
            editorContent.scrollTop = top;
        },
        getScrollTop () {
            let editorContent = this.$el.querySelectorAll(".tip-tap-editor-container")[0];
            return editorContent.scrollTop ? editorContent.scrollTop : 0;
        },
        close() {
            if (this.unsave) {
                this.$infoBox(
                    this.local(`Are you sure to quit with out saved?`),
                    {
                        status: "default",
                        title: this.local("Confirm"),
                        confirmTitle: this.local("Confirm"),
                        cancelTitle: this.local("Cancel"),
                        theme: this.theme,
                        confirm: () => {
                            this.toggleEditor(false);
                        },
                        cancel: () => {},
                    }
                );
            } else this.toggleEditor(false);
        },
    },
    beforeDestroy() {
        this.TimeoutDestroy();
    },
};
</script>

<style lang="scss">
.ikfb-editor-container {
    position: fixed;
    width: calc(100% - 350px);
    height: 100%;
    top: 0px;
    right: 0px;
    padding-top: 32px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    overflow: hidden;
    z-index: 2;

    &.dark {
        background: rgba(47, 52, 55, 1);
    }

    &.fullScreen {
        width: 100%;
    }

    .control-banner {
        @include Vcenter;

        position: relative;
        min-height: 40px;
        height: 40px;

        .control-left-block {
            @include Vcenter;

            flex: 1;
        }

        .control-right-block {
            @include Vcenter;

            .save-btn {
                margin-right: 15px;
            }

            .control-btn:last-child {
                margin-right: 15px;
            }
        }

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .nav-banner {
        position: relative;
        width: 100%;
        height: 40px;

        display: flex;
        align-items: center;
    }

    .bottom-control {
        @include HendVcenter;

        position: absolute;
        right: 0px;
        bottom: 0px;
        width: 100%;
        height: 35px;
        background: rgba(245, 245, 245, 0.6);
        font-size: 12px;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);

        &.dark {
            background: rgba(36, 36, 36, 0.6);
            color: whitesmoke;
        }

        &.close {
            width: 25px;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            overflow: hidden;
        }

        * {
            @include Vcenter;
        }

        .trigger {
            height: 100%;
            padding: 5px;
            box-sizing: border-box;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }
        }
    }

    .quick-nav-block {
        position: absolute;
        left: 5px;
        top: 80px;
        width: 350px;
        height: calc(100% - 85px);
        padding: 5px;
        background: rgba(245, 245, 245, 0.6);
        border-right: solid rgba(75, 75, 75, 0.1) thin;
        border-radius: 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: auto;
        z-index: 9;

        &.dark {
            background: rgba(36, 36, 36, 0.6);

            .item {
                color: whitesmoke;
            }
        }

        .item {
            width: 100%;
            min-height: 55px;
            height: 55px;
            padding: 0px 15px;
            font-size: 13.8px;
            font-weight: 600;
            border: rgba(200, 200, 200, 0.1) solid thin;
            border-radius: 8px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;

            &.choosen {
                background: rgba(200, 200, 200, 0.6);

                &:hover {
                    background: rgba(200, 200, 200, 0.6);
                }
            }

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            .info-content-block {
                @include VcenterC;

                flex: 1;
                margin: 0px 5px;

                .date {
                    font-size: 12px;
                    opacity: 0.6;
                }
            }

            p {
                @include nowrap;

                &.sec {
                    font-size: 12px;
                    font-weight: normal;
                }

                &.highlight {
                    text-align: left;
                    cursor: pointer;

                    &:hover {
                        color: rgba(0, 120, 212, 1);
                        text-decoration: underline;
                    }
                }
            }
        }
    }

    .ProseMirror {
        p {
            line-height: 2;
        }
    }
}
</style>