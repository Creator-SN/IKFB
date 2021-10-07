<template>
    <div
        class="ikfb-templates-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{local('Templates')}}</p>
        </div>
        <div class="m-templates-block">
            <div class="row between">
                <fv-text-box
                    v-model="currentSearch"
                    :placeholder="local('Filtering from current content')"
                    :theme="theme"
                    :background="theme === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(245, 245, 245, 1)'"
                    icon="Filter"
                    borderWidth="2"
                    :revealBorder="true"
                    style="box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1)"
                ></fv-text-box>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :theme="theme"
                    :background="theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 1)'"
                    style="flex: 1"
                ></fv-command-bar>
            </div>
            <div class="row main-table">
                <fv-details-list
                    :value="templates"
                    :head="head"
                    :filter="currentSearch"
                    :theme="theme"
                    style="width: 100%; height: 100%"
                    ref="table"
                    :multiSelection="true"
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                >
                    <template v-slot:column_0="x">
                        <p class="sec">{{ x.row_index + 1 }}</p>
                    </template>
                    <template v-slot:column_1="x">
                        <p :title="x.item.emoji">{{ x.item.emoji }}</p>
                    </template>
                    <template v-slot:column_2="x">
                        <p
                            class="highlight"
                            @click="openEditor(x.item)"
                        >{{ x.item.name }}</p>
                    </template>
                    <template v-slot:column_3="x">
                        <p class="sec">{{ x.item.createDate }}</p>
                    </template>
                    <template v-slot:menu>
                        <div>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("Rename Template")}}</p>
                            </span>
                            <span @click="deleteTemplate">
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Delete Template")}}</p>
                            </span>
                        </div>
                    </template>
                </fv-details-list>
            </div>
        </div>
        <add-template :show.sync="show.add"></add-template>
        <rename-template
            :value="currentItem"
            :show.sync="show.rename"
        ></rename-template>
    </div>
</template>

<script>
import addTemplate from "@/components/templates/addTemplate.vue";
import renameTemplate from "@/components/templates/renameTemplate.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        addTemplate,
        renameTemplate,
    },
    data() {
        return {
            cmd: [
                {
                    name: () => this.local("Add"),
                    icon: "Add",
                    iconColor: "rgba(0, 90, 158, 1)",
                    disabled: () => this.ds_db === null || !this.lock,
                    func: () => {
                        this.show.add = true;
                    },
                },
                {
                    name: () => this.local("Delete"),
                    icon: "Delete",
                    iconColor: "rgba(173, 38, 45, 1)",
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: this.deleteTemplates,
                },
            ],
            head: [
                { content: "No.", width: 120 },
                { content: "Icon", sortName: "emoji", width: 80 },
                { content: "Name", sortName: "name", width: 300 },
                { content: "Create Date", sortName: "createDate", width: 120 },
            ],
            currentItem: {},
            currentChoosen: [],
            currentSearch: "",
            show: {
                add: false,
                rename: false,
            },
            lock: true,
        };
    },
    watch: {
        $route() {
            this.templatesEnsureFolder();
            this.$refs.table.headInit();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            templates: (state) => state.data_structure.templates,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
    },
    mounted() {
        this.templatesEnsureFolder();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            reviseEditor: "reviseEditor",
            toggleEditor: "toggleEditor",
        }),
        templatesEnsureFolder() {
            if (!this.ds_db || this.data_index == -1) return;
            this.lock = false;
            ipc.send(
                "ensure-folder",
                path.join(this.data_path[this.data_index], "root/templates")
            );
            ipc.on("ensure-folder-callback", () => {
                this.lock = true;
            });
        },
        deleteTemplate() {
            if (!this.currentItem.id || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete this template?`), {
                status: "error",
                title: this.local("Delete Template"),
                confirmTitle: this.local("Confirm"),
                cancelTitle: this.local("Cancel"),
                theme: this.theme,
                confirm: () => {
                    this.lock = false;
                    let index = this.templates.indexOf(
                        this.templates.find(
                            (it) => it.id === this.currentItem.id
                        )
                    );
                    this.templates.splice(index, 1);
                    this.reviseDS({
                        $index: this.data_index,
                        templates: this.templates,
                    });
                    ipc.send(
                        "remove-file",
                        path.join(
                            this.data_path[this.data_index],
                            "root/templates",
                            `${this.currentItem.id}.json`
                        )
                    );
                    this.lock = true;
                },
                cancel: () => {},
            });
        },
        deleteTemplates() {
            if (!this.currentChoosen || !this.lock) return;
            this.$infoBox(
                this.local(`Are you sure to delete these templates?`),
                {
                    status: "error",
                    title: this.local("Delete Templates"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        this.lock = false;
                        let copy = JSON.parse(
                            JSON.stringify(this.currentChoosen)
                        );
                        copy.forEach((el) => {
                            let index = this.templates.indexOf(
                                this.templates.find((it) => it.id === el.id)
                            );
                            this.templates.splice(index, 1);
                            this.reviseDS({
                                $index: this.data_index,
                                templates: this.templates,
                            });
                            ipc.send(
                                "remove-file",
                                path.join(
                                    this.data_path[this.data_index],
                                    "root/templates",
                                    `${el.id}.json`
                                )
                            );
                            this.lock = true;
                        });
                    },
                    cancel: () => {},
                }
            );
        },
        openEditor(template) {
            this.reviseEditor({
                type: "template",
                target: template,
            });
            this.toggleEditor(true);
        },
    },
};
</script>

<style lang="scss">
.ikfb-templates-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(245, 245, 245, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);

        .s-title {
            color: whitesmoke;
        }

        .m-templates-block {
            .row {
                &.main-table {
                    background: black;
                }
            }
        }
    }

    .s-row {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }

    .m-templates-block {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1;
        box-sizing: border-box;
        overflow: hidden;

        display: flex;
        flex-direction: column;

        .row {
            position: relative;
            width: 100%;
            height: auto;
            padding: 12px;
            box-sizing: border-box;

            &.between {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            &.command-bar {
                padding: 0px 12px;
                display: flex;
                align-items: center;
            }

            &.main-table {
                width: calc(100% - 24px);
                flex: 1;
                margin: 8px 12px;
                padding: 0px;
                background: white;
                border-radius: 5px;
                box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;

                p.highlight {
                    text-align: center;
                    cursor: pointer;

                    &:hover {
                        color: rgba(0, 120, 212, 1);
                        text-decoration: underline;
                    }
                }
            }

            &.bottom-control {
                width: calc(100% - 24px);
                height: 45px;
                margin: 8px 12px;
                padding: 0px;
                border-radius: 5px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .head-info {
                position: absolute;
                left: 0px;
                top: 100%;
                width: 100%;
                height: auto;
                background: whitesmoke;
                display: flex;
                flex-direction: column;
                box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.1);
                z-index: 20;

                .item {
                    width: 100%;
                    min-height: 35px;
                    height: 35px;
                    padding: 0px 15px;
                    font-size: 12px;
                    font-weight: 400;
                    box-sizing: border-box;
                    grid-template-columns: 80px 80px 80px 1fr;
                    display: grid;
                    align-items: center;
                }
            }
        }
    }
}
</style>