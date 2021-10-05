<template>
    <div
        class="ikfb-home-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{local('All')}}</p>
        </div>
        <div class="m-home-block">
            <div class="row between">
                <fv-text-box
                    v-model="currentSearch"
                    placeholder="从当前内容筛选"
                    icon="Filter"
                    borderWidth="2"
                    :revealBorder="true"
                    style="box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1)"
                ></fv-text-box>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :background="'rgba(245, 245, 245, 1)'"
                    style="flex: 1"
                ></fv-command-bar>
            </div>
            <div class="row main-table">
                <fv-details-list
                    :value="items"
                    :head="head"
                    :filter="currentSearch"
                    style="width: 100%; height: 100%"
                    ref="table"
                    :multiSelection="true"
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                >
                    <template v-slot:column_0="x">
                        <i
                            :class="`ms-Icon ms-Icon--${x.item.showInfo ? 'CaretBottomRightCenter8' : 'CaretRight8'}`"
                            @click="x.item.showInfo ^= true"
                        ></i>
                    </template>
                    <template v-slot:column_1="x">
                        <p class="sec">{{ x.row_index + 1 }}</p>
                    </template>
                    <template v-slot:column_2="x">
                        <p :title="x.item.emoji">{{ x.item.emoji }}</p>
                    </template>
                    <template v-slot:column_3="x">
                        <p class="highlight" @click="openFile(`${x.item.id}/${x.item.pdf}.pdf`)">{{ x.item.name }}</p>
                    </template>
                    <template v-slot:column_4="x">
                        <p class="sec">{{x.item.name}} labels</p>
                    </template>
                    <template v-slot:column_5="x">
                        <p class="sec">{{ x.item.createDate }}</p>
                    </template>
                    <template v-slot:row_expand="x">
                        <div
                            v-show="x.item.showInfo"
                            class="row-item-info"
                        >
                            <div
                                v-show="x.item.pdf"
                                class="item"
                                @dblclick="openFile(`${x.item.id}/${x.item.pdf}.pdf`)"
                            >
                                <i class="ms-Icon ms-Icon--PDF"></i>
                                <p>PDF</p>
                                <p class="sec highlight" @click="openFile(`${x.item.id}/${x.item.pdf}.pdf`)">{{x.item.pdf}}.pdf</p>
                                <p></p>
                            </div>
                            <div class="item">
                                <i class="ms-Icon ms-Icon--LinkedDatabase"></i>
                                <p>Metadata</p>
                                <p class="sec highlight">{{x.item.id}}.metadata</p>
                                <p></p>
                            </div>
                            <div
                                v-for="(page, index) in x.item.pages"
                                :key="index"
                                class="item"
                            >
                                <p>{{page.emoji}}</p>
                                <p class="highlight" @click="openEditor(x.item, page)">{{page.name}}</p>
                                <p class="sec">{{page.id}}</p>
                                <p class="sec">{{page.createDate}}</p>
                                <fv-button background="rgba(255, 180, 0, 1)" style="width: 25px; height: 25px;" :title="local('Rename')" @click="showRenameItemPage(x.item, page)">
                                    <i class="ms-Icon ms-Icon--Rename"></i>
                                </fv-button>
                            </div>
                        </div>
                    </template>
                    <template v-slot:menu>
                        <div>
                            <span @click="show.addItemPage = true">
                                <i
                                    class="ms-Icon ms-Icon--PageAdd"
                                    style="color: rgba(226, 159, 0, 1);"
                                ></i>
                                <p>{{local("Add Page")}}</p>
                            </span>
                            <span @click="reviseItemPdf">
                                <i
                                    class="ms-Icon ms-Icon--PDF"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Revise PDF")}}</p>
                            </span>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--LinkedDatabase"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("View Metadata")}}</p>
                            </span>
                            <hr>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("Rename Item")}}</p>
                            </span>
                            <span @click="deleteItem">
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Delete Item")}}</p>
                            </span>
                        </div>
                    </template>
                </fv-details-list>
            </div>
        </div>
        <add-item :show.sync="show.add"></add-item>
        <rename-item
            :value="currentItem"
            :show.sync="show.rename"
        ></rename-item>
        <add-item-page
            :show.sync="show.addItemPage"
            :item="currentItem"
        ></add-item-page>
        <rename-item-page
            :value="currentItemPage"
            :show.sync="show.renameItemPage"
            :item="currentItem"
        ></rename-item-page>
        <pdf-importer
            v-model="show.pdfImporter"
            :mode="mode"
            :item="currentItem"
            ref="pdf_importer"
        ></pdf-importer>
    </div>
</template>

<script>
import addItem from "@/components/home/addItem.vue";
import renameItem from "@/components/home/renameItem.vue";
import addItemPage from "@/components/home/addItemPage.vue";
import renameItemPage from "@/components/home/renameItemPage.vue";
import pdfImporter from "@/components/general/pdfImporter.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        addItem,
        renameItem,
        addItemPage,
        renameItemPage,
        pdfImporter,
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
                    name: () => this.local("Import"),
                    icon: "Upload",
                    iconColor: "rgba(0, 90, 158, 1)",
                    disabled: () => this.ds_db === null || !this.lock,
                    func: this.importPdf,
                },
                {
                    name: () => this.local("Delete"),
                    icon: "Delete",
                    iconColor: "rgba(173, 38, 45, 1)",
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: this.deleteItems,
                },
            ],
            head: [
                { content: "", width: 80 },
                { content: "No.", width: 80 },
                { content: "Icon", sortName: "emoji", width: 80 },
                { content: "Name", sortName: "name", width: 300 },
                { content: "Labels", width: 120 },
                { content: "Create Date", sortName: "createDate", width: 120 },
            ],
            currentItem: {},
            currentChoosen: [],
            currentItemPage: {},
            currentSearch: "",
            mode: "item",
            show: {
                add: false,
                rename: false,
                addItemPage: false,
                renameItemPage: false,
                pdfImporter: false,
            },
            lock: true,
        };
    },
    watch: {
        $route() {
            this.itemsEnsureFolder();
            this.$refs.table.headInit();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            items: (state) => state.data_structure.items,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
    },
    mounted() {
        this.itemsEnsureFolder();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            reviseEditor: "reviseEditor",
            toggleEditor: "toggleEditor",
        }),
        itemsEnsureFolder() {
            if (!this.ds_db || this.data_index == -1) return;
            this.lock = false;
            ipc.send(
                "ensure-folder",
                path.join(this.data_path[this.data_index], "root/items")
            );
            ipc.on("ensure-folder-callback", () => {
                this.lock = true;
            });
        },
        deleteItem() {
            if (!this.currentItem.id || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete this item?`), {
                status: "error",
                title: this.local("Delete Item"),
                confirmTitle: this.local("Confirm"),
                cancelTitle: this.local("Cancel"),
                theme: this.theme,
                confirm: () => {
                    this.lock = false;
                    let index = this.items.indexOf(
                        this.items.find((it) => it.id === this.currentItem.id)
                    );
                    this.items.splice(index, 1);
                    this.reviseDS({
                        $index: this.data_index,
                        items: this.items,
                    });
                    ipc.send(
                        "remove-folder",
                        path.join(
                            this.data_path[this.data_index],
                            `root/items/${this.currentItem.id}`
                        )
                    );
                    this.lock = true;
                },
                cancel: () => {},
            });
        },
        deleteItems() {
            if (!this.currentChoosen || !this.lock) return;
            this.$infoBox(this.local(`Are you sure to delete these items?`), {
                status: "error",
                title: this.local("Delete Items"),
                confirmTitle: this.local("Confirm"),
                cancelTitle: this.local("Cancel"),
                theme: this.theme,
                confirm: () => {
                    this.lock = false;
                    let copy = JSON.parse(JSON.stringify(this.currentChoosen));
                    copy.forEach((el) => {
                        let index = this.items.indexOf(
                            this.items.find((it) => it.id === el.id)
                        );
                        this.items.splice(index, 1);
                        this.reviseDS({
                            $index: this.data_index,
                            items: this.items,
                        });
                        ipc.send(
                            "remove-folder",
                            path.join(
                                this.data_path[this.data_index],
                                `root/items/${el.id}`
                            )
                        );
                        this.lock = true;
                    });
                },
                cancel: () => {},
            });
        },
        reviseItemPdf() {
            this.mode = "item";
            this.$refs.pdf_importer.inputInspectClick();
        },
        importPdf() {
            this.mode = "import";
            this.$refs.pdf_importer.inputInspectClick();
        },
        openEditor(item, page) {
            this.reviseEditor({
                type: "item",
                item: item,
                target: page,
            });
            this.toggleEditor(true);
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
        showRenameItemPage(item, page) {
            this.currentItem = item;
            this.currentItemPage = page;
            this.show.renameItemPage = true;
        },
    },
};
</script>

<style lang="scss">
.ikfb-home-container {
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

    .m-home-block {
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

            .row-item-info {
                position: absolute;
                left: 0px;
                top: 100%;
                width: 100%;
                height: auto;
                background: whitesmoke;
                display: flex;
                flex-direction: column;
                box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.1);
                z-index: 2;

                .item {
                    width: 100%;
                    min-height: 45px;
                    height: 45px;
                    padding: 0px 15px;
                    font-size: 13.8px;
                    font-weight: 600;
                    box-sizing: border-box;
                    grid-template-columns: 50px 80px 80px 150px 1fr;
                    display: grid;
                    align-items: center;
                    cursor: pointer;
                    user-select: none;

                    &:hover {
                        background: rgba(200, 200, 200, 0.3);
                    }

                    &:active {
                        background: rgba(200, 200, 200, 0.6);
                    }

                    .ms-Icon--PDF {
                        color: rgba(173, 38, 45, 1);
                    }

                    .ms-Icon--LinkedDatabase
                    {
                        color: rgba(255, 180, 0, 1);
                    }

                    p.sec
                    {
                        font-size: 12px;
                        font-weight: normal;
                    }

                    p.highlight {
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
    }
}
</style>