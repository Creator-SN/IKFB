<template>
    <div
        class="ikfb-home-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{pid === false ? local('All') : pname}}</p>
        </div>
        <div class="m-home-block">
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
                <div class="sort-block">
                    <fv-combobox
                    v-model="sortKey"
                    :options="sortOptions"
                    :placeholder="local('Sort by')"
                    :inputBackground="theme === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(245, 245, 245, 1)'"
                    :borderRadius="3"
                    :theme="theme"
                    style="width: 120px;"
                ></fv-combobox>
                <fv-button :theme="theme" :disabled="sortKey.key == undefined" style="width: 35px; height: 35px; margin-left: 5px;" @click="sortDesc = -sortDesc">
                    <i class="ms-Icon" :class="[`ms-Icon--${sortDesc == 1 ? 'Ascending' : 'Descending'}`]" style="font-size: 18px;"></i>
                </fv-button>
                </div>
            </div>
            <div class="row command-bar">
                <fv-command-bar
                    :options="cmd"
                    :theme="theme"
                    :background="theme === 'dark' ? 'transparent' : 'rgba(245, 245, 245, 1)'"
                    style="flex: 1;"
                ></fv-command-bar>
            </div>
            <div class="row main-table">
                <main-list
                    :value="filterItems"
                    :edit="editable"
                    :sortKey="sortKey.key"
                    :desc="sortDesc"
                    :theme="theme"
                    :filter="currentSearch"
                    @open-file="openFile"
                    @label-click="($event) => {currentItem = $event; show.rename = true}"
                    @rightclick="currentItem = $event"
                    @choose-items="currentChoosen = $event"
                >
                    <template v-slot:row_expand="x">
                        <div class="main-row-item-info">
                            <div
                                v-show="x.item.pdf"
                                class="item"
                                @dblclick="openFile(`${x.item.id}/${x.item.pdf}.pdf`)"
                            >
                                <i class="ms-Icon ms-Icon--PDF"></i>
                                <p
                                    class="highlight"
                                    @click="openFile(`${x.item.id}/${x.item.pdf}.pdf`)"
                                >PDF</p>
                                <p
                                    class="sec highlight"
                                    @click="openFile(`${x.item.id}/${x.item.pdf}.pdf`)"
                                >{{x.item.pdf}}.pdf</p>
                                <p></p>
                                <fv-button
                                    background="rgba(255, 180, 0, 1)"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open Folder')"
                                    @click="openFile(`${x.item.id}`)"
                                >
                                    <i class="ms-Icon ms-Icon--FabricFolder"></i>
                                </fv-button>
                            </div>
                            <div
                                v-show="x.item.metadata"
                                class="item"
                            >
                                <i class="ms-Icon ms-Icon--LinkedDatabase"></i>
                                <p
                                    class="highlight"
                                    @click="showMetadata(x.item)"
                                >Metadata</p>
                                <p
                                    class="sec highlight"
                                    @click="showMetadata(x.item)"
                                >{{x.item.id}}.metadata</p>
                                <p></p>
                                <fv-button
                                    background="rgba(255, 180, 0, 1)"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Open Folder')"
                                    @click="openFile(`${x.item.id}`)"
                                >
                                    <i class="ms-Icon ms-Icon--FabricFolder"></i>
                                </fv-button>
                            </div>
                            <div
                                v-for="(page, index) in x.item.pages"
                                :key="index"
                                class="item"
                            >
                                <p>{{page.emoji}}</p>
                                <p
                                    class="highlight"
                                    @click="openEditor(x.item, page)"
                                >{{page.name}}</p>
                                <p class="sec">{{page.id}}</p>
                                <p class="sec">{{page.createDate}}</p>
                                <fv-button
                                    theme="dark"
                                    background="rgba(0, 120, 212, 1)"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Rename')"
                                    @click="showRenameItemPage(x.item, page)"
                                >
                                    <i class="ms-Icon ms-Icon--Rename"></i>
                                </fv-button>
                                <fv-button
                                    theme="dark"
                                    background="rgba(220, 62, 72, 1)"
                                    style="width: 35px; height: 35px;"
                                    :title="local('Delete')"
                                    @click="deleteItemPage(x.item.id, page.id)"
                                >
                                    <i class="ms-Icon ms-Icon--Delete"></i>
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
                            <span @click="show.metadata = true">
                                <i
                                    class="ms-Icon ms-Icon--LinkedDatabase"
                                    style="color: rgba(255, 180, 0, 1);"
                                ></i>
                                <p>{{local("Revise Metadata")}}</p>
                            </span>
                            <span @click="openFile(`${currentItem.id}`)">
                                <i
                                    class="ms-Icon ms-Icon--FabricFolder"
                                    style="color: rgba(255, 180, 0, 1);"
                                ></i>
                                <p>{{local("Open Folder")}}</p>
                            </span>
                            <hr>
                            <span @click="show.folder = true">
                                <i
                                    class="ms-Icon ms-Icon--FabricMovetoFolder"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("Copy to Partitions")}}</p>
                            </span>
                            <span @click="show.rename = true">
                                <i
                                    class="ms-Icon ms-Icon--Rename"
                                    style="color: rgba(0, 153, 204, 1);"
                                ></i>
                                <p>{{local("Rename Item")}}</p>
                            </span>
                            <span
                                v-show="pid !== false"
                                @click="deleteItemsFromPartition"
                            >
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Remove From Partition")}}</p>
                            </span>
                            <span
                                v-show="pid === false"
                                @click="deleteItem"
                            >
                                <i
                                    class="ms-Icon ms-Icon--Delete"
                                    style="color: rgba(173, 38, 45, 1);"
                                ></i>
                                <p>{{local("Delete Item")}}</p>
                            </span>
                        </div>
                    </template>
                </main-list>
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
        <metadata-panel
            v-model="show.metadata"
            :item="currentItem"
        ></metadata-panel>
        <folder-window
            v-model="show.folder"
            @choose-partitions="copyItemsToPartitions"
        ></folder-window>
    </div>
</template>

<script>
import addItem from "@/components/home/addItem.vue";
import renameItem from "@/components/home/renameItem.vue";
import mainList from "@/components/home/mainList.vue";
import addItemPage from "@/components/home/addItemPage.vue";
import renameItemPage from "@/components/home/renameItemPage.vue";
import metadataPanel from "@/components/home/metadataPanel.vue";
import folderWindow from "@/components/general/folderWindow.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        addItem,
        renameItem,
        mainList,
        addItemPage,
        renameItemPage,
        metadataPanel,
        folderWindow,
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
                    name: () => {
                        if (this.editable)
                            return this.local("Cancel Multi-Selection");
                        return this.local("Multi-Selection");
                    },
                    icon: "GroupedList",
                    iconColor: "rgba(0, 90, 158, 1)",
                    disabled: () => this.ds_db === null || !this.lock,
                    func: () => {
                        this.editable ^= true;
                    },
                },
                {
                    name: () => this.local("Copy to Partitions"),
                    icon: "FabricMovetoFolder",
                    iconColor: "rgba(0, 90, 158, 1)",
                    disabled: () =>
                        this.currentChoosen.length === 0 || !this.lock,
                    func: () => {
                        this.show.folder = true;
                    },
                },
                {
                    name: () => this.local("Remove From Partition"),
                    icon: "Delete",
                    iconColor: "rgba(173, 38, 45, 1)",
                    disabled: () =>
                        this.currentChoosen.length === 0 ||
                        !this.lock ||
                        this.pid === false,
                    func: this.deleteItemsFromPartition,
                },
                {
                    name: () => this.local("Delete"),
                    icon: "Delete",
                    iconColor: "rgba(173, 38, 45, 1)",
                    disabled: () =>
                        this.currentChoosen.length === 0 ||
                        !this.lock ||
                        this.pid !== false,
                    func: this.deleteItems,
                },
            ],
            sortKey: {},
            sortOptions: [
                { key: "name", text: () => this.local("Name") },
                { key: "title", text: () => this.local("Title") },
                { key: "publisher", text: () => this.local("Publisher") },
                { key: "createDate", text: () => this.local("CreateDate") },
                { key: "year", text: () => this.local("Year") }
            ],
            sortDesc: 1,
            editable: false,
            filterItems: [],
            currentItem: {},
            currentChoosen: [],
            currentItemPage: {},
            currentSearch: "",
            show: {
                add: false,
                rename: false,
                addItemPage: false,
                renameItemPage: false,
                metadata: false,
                folder: false,
                pdfImporter: false,
            },
            lock: true,
        };
    },
    watch: {
        $route() {
            this.itemsEnsureFolder();
            this.refreshFilterItems();
        },
        c() {
            this.refreshFilterItems();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            items: (state) => state.data_structure.items,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            value: (state) => state.pdfImporter.value,
            item: (state) => state.pdfImporter.item,
            pdf_importer: (state) => state.pdfImporter.pdf_importer,
            mode: (state) => state.pdfImporter.mode,
            c: (state) => state.pdfImporter.c,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        pid() {
            if (this.$route.params.id === undefined) return false;
            return this.$route.params.id;
        },
        pname() {
            if (this.pid === false) return "Unknown";
            let t = [].concat(this.groups);
            let partitions = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].id === this.pid) {
                    return partitions[i].name;
                }
            }
            return "Unknown";
        },
        filterItemsId() {
            if (this.pid === false) return true;
            let t = [].concat(this.groups);
            let partitions = [];
            let result = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].id === this.pid) {
                    result = JSON.parse(JSON.stringify(partitions[i].items));
                    break;
                }
            }
            return result;
        },
    },
    mounted() {
        this.itemsEnsureFolder();
        this.refreshFilterItems();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            reviseEditor: "reviseEditor",
            revisePdfImporter: "revisePdfImporter",
            toggleEditor: "toggleEditor",
        }),
        refreshFilterItems() {
            if (this.filterItemsId === true) this.filterItems = this.items;
            else {
                let result = [];
                this.items.forEach((el, idx) => {
                    if (this.filterItemsId.indexOf(el.id) > -1)
                        result.push(this.items[idx]);
                });
                this.filterItems = result;
            }
        },
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
                    this.delItemsFromPs([this.currentItem.id]);
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
                    let ids = [];
                    let copy = JSON.parse(JSON.stringify(this.currentChoosen));
                    copy.forEach((el) => {
                        ids.push(el.id);
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
                        this.delItemsFromPs(ids);
                        this.currentChoosen = [];
                        this.lock = true;
                    });
                },
                cancel: () => {},
            });
        },
        delItemsFromPs(ids) {
            if (ids.length === 0) return;
            let t = [].concat(this.groups);
            let partitions = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            partitions.forEach((p, idx) => {
                for (let i = 0; i < ids.length; i++) {
                    let index = p.items.indexOf(ids[i]);
                    if (index > -1) {
                        p.items.splice(index, 1);
                    }
                }
                partitions[idx].items = p.items;
            });
        },
        reviseItemPdf() {
            this.revisePdfImporter({
                mode: "item",
                item: this.currentItem,
            });
            setTimeout(() => {
                this.pdf_importer.inputInspectClick();
            }, 300);
        },
        importPdf() {
            this.revisePdfImporter({
                mode: "import",
            });
            setTimeout(() => {
                this.pdf_importer.inputInspectClick();
            }, 300);
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
        copyItemsToPartitions(partitions_id) {
            let t = [].concat(this.groups);
            let partitions = [];
            let result = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions_id.indexOf(partitions[i].id) > -1)
                    result.push(partitions[i]);
            }
            let choosen = this.currentChoosen;
            if (
                this.currentChoosen.find(
                    (it) => it.id === this.currentItem.id
                ) === undefined
            )
                choosen.push(this.currentItem);
            if (choosen.length === 0) return;
            result.forEach((p, idx) => {
                for (let i = 0; i < choosen.length; i++) {
                    if (
                        p.items.find((it) => it === choosen[i].id) !== undefined
                    )
                        continue;
                    p.items.push(choosen[i].id);
                }
                result[idx].items = p.items;
            });
            this.currentChoosen = [];
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
        },
        deleteItemsFromPartition() {
            if (this.pid === false) return;
            let t = [].concat(this.groups);
            let partitions = [];
            let target = {};
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].id === this.pid) {
                    target = partitions[i];
                    break;
                }
            }
            let choosen = this.currentChoosen;
            if (
                this.currentChoosen.find(
                    (it) => it.id === this.currentItem.id
                ) === undefined
            )
                choosen.push(this.currentItem);
            if (choosen.length === 0) return;
            for (let i = 0; i < choosen.length; i++) {
                let index = target.items.indexOf(choosen[i].id);
                if (index > -1) {
                    target.items.splice(index, 1);
                }
            }
            this.currentChoosen = [];
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshFilterItems();
        },
        showRenameItemPage(item, page) {
            this.currentItem = item;
            this.currentItemPage = page;
            this.show.renameItemPage = true;
        },
        showMetadata(item) {
            this.currentItem = item;
            this.show.metadata = true;
        },
        async deleteItemPage(itemId, pageId) {
            this.$infoBox(this.local(`Are you sure to delete this page?`), {
                status: "error",
                title: this.local("Delete Page"),
                confirmTitle: this.local("Confirm"),
                cancelTitle: this.local("Cancel"),
                theme: this.theme,
                confirm: async () => {
                    let item = this.items.find((it) => it.id === itemId);
                    let index = item.pages.indexOf(pageId);
                    item.pages.splice(index, 1);
                    await this.reviseDS({
                        $index: this.data_index,
                        items: this.items,
                    });
                    ipc.send(
                        "remove-file",
                        path.join(
                            this.data_path[this.data_index],
                            `root/items/${item.id}`,
                            `${pageId}.json`
                        )
                    );
                },
                cancel: () => {},
            });
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
    z-index: 1;

    &.dark {
        background: rgba(36, 36, 36, 1);

        .s-title {
            color: whitesmoke;
        }

        .m-home-block {
            .row {
                &.main-table {
                    background: black;
                }

                .row-item-info {
                    background: rgba(37, 36, 35, 1);
                    color: whitesmoke;
                    box-shadow: 0px 12px 20px rgba(120, 120, 120, 0.2);
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
                overflow-x: auto;
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

                i.drop-down-icon {
                    @include HcenterVcenter;

                    width: 100%;
                    height: 100%;

                    &:hover {
                        background: rgba(200, 200, 200, 0.3);
                    }
                }

                .main-row-item-info {
                    position: relative;
                    width: 100%;
                    height: auto;
                    display: flex;
                    flex-direction: column;
                    z-index: 1;

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
                        grid-template-columns: 50px 160px 90px 150px 50px 1fr;
                        display: grid;
                        align-items: center;
                        cursor: pointer;
                        user-select: none;

                        &:hover {
                            background: rgba(200, 200, 200, 0.1);
                        }

                        &:active {
                            background: rgba(200, 200, 200, 0.3);
                        }

                        .ms-Icon--PDF {
                            color: rgba(245, 62, 72, 1);
                        }

                        .ms-Icon--LinkedDatabase {
                            color: rgba(245, 149, 17, 1);
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

            .sort-block
            {
                @include HcenterVcenter;
            }

            .fv-rightMenu {
                z-index: 3;
            }
        }
    }
}
</style>