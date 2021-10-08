<template>
    <transition :name="show_editor ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="show_editor"
            class="ikfb-editor-container"
            :class="[{dark: theme == 'dark', fullScreen: fullScreen}]"
        >
            <div class="control-banner">
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="fullScreen ^= true"
                >
                    <i
                        class="ms-Icon"
                        :class="[fullScreen ? 'ms-Icon--BackToWindow' : 'ms-Icon--FullScreen']"
                    ></i>
                </fv-button>
                <fv-button
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    @click="close"
                >
                    <i class="ms-Icon ms-Icon--Cancel"></i>
                </fv-button>
                <fv-button
                    v-show="unsave"
                    :theme="theme"
                    :borderRadius="30"
                    class="control-btn"
                    background="rgba(0, 204, 153, 1)"
                >
                    {{''}}
                </fv-button>
            </div>
            <power-editor
                :value="content"
                :placeholder="local('Write something ...')"
                :theme="theme"
                :editorOutSideBackground="theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'"
                :mobileDisplayWidth="0"
                ref="editor"
                style="position: relative; width: 100%; flex: 1;"
                @save-json="saveContent"
            ></power-editor>
        </div>
    </transition>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    data() {
        return {
            content: "",
            fullScreen: false,
            unsave: false,
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
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            templates: (state) => state.data_structure.templates,
            theme: (state) => state.theme,
            show_editor: (state) => state.editor.show,
            type: (state) => state.editor.type,
            item: (state) => state.editor.item,
            target: (state) => state.editor.target,
        }),
        ...mapGetters(["local", "ds_db"]),
    },
    mounted() {
        this.ShortCutInit();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            toggleEditor: "toggleEditor",
        }),
        ShortCutInit() {
            this.$el.addEventListener("keydown", (event) => {
                if (event.keyCode === 83 && event.ctrlKey) {
                    this.$refs.editor.save();
                    this.unsave = false;
                } else {
                    let filterKey = [17, 16, 20];
                    if (filterKey.indexOf(event.keyCode) < 0)
                        this.unsave = true;
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
            ipc.send("read-file", url);
            let content = await new Promise((resolve) => {
                ipc.on("read-file-callback", (event, data) => {
                    resolve(data);
                });
            });
            try {
                this.content = JSON.parse(content);
            } catch (e) {
                this.content = content;
            }
            if(this.content === '') this.$refs.editor.focus();
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
        height: 40px;

        .control-btn {
            width: 30px;
            height: 30px;
            margin: 5px;
        }
    }

    .ProseMirror {
        p {
            line-height: 2;
        }
    }
}
</style>