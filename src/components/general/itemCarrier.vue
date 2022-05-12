<template>
    <transition :name="itemCarrier.itemsX.length > 0 ? 'move-right-to-left' : 'move-left-to-right'">
        <div
            v-show="itemCarrier.itemsX.length > 0"
            class="ikfb-item-carrier"
            :class="[{ dark: theme == 'dark', show: show.panel }]"
        >
            <div
                v-show="!show.panel"
                class="carrier-flag"
                @click="show.panel = true"
            >
                <i class="ms-Icon ms-Icon--ChevronLeftSmall"></i>
            </div>
            <fv-panel
                v-model="show.panel"
                :title="local('Item Transfer Carrier')"
                :theme="theme"
                width="600px"
                height="60%"
                :is-central-side="true"
                :is-footer="true"
            >
                <template v-slot:container>
                    <div class="panel-container">
                        <fv-collapse
                            v-for="(itemX, index) in itemCarrier.itemsX"
                            v-show="itemX.item.show"
                            :theme="theme"
                            :key="index"
                            :title="itemX.item.name"
                            :content="`${local('From')}: ${itemX.path}`"
                            :disabled-collapse="true"
                            style="margin: 5px;"
                            @contextmenu.native="rightClick($event, itemX.item)"
                        >
                            <template v-slot:icon>
                                <div class="icon-block">
                                    <p class="index">{{index + 1}}</p>
                                    <fv-check-box
                                        v-model="itemX.choosen"
                                        :borderColor="theme == 'dark' ? 'whitesmoke' : ''"
                                        @click="itemChooseClick(itemX.item)"
                                    ></fv-check-box>
                                </div>
                            </template>
                            <template v-slot:title="x">
                                <div class="custom-collapse-title">
                                    <p
                                        class="title-content h"
                                        :title="x.title"
                                    >{{ x.title }}</p>
                                </div>
                            </template>
                            <template v-slot:content="x">
                                <div
                                    class="collapse-info"
                                    style="display: flex;"
                                >
                                    <p
                                        style="width: 180px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"
                                        :title="x.content"
                                    >{{ x.content }}</p>
                                    <fv-button
                                        v-if="itemX.item.metadata && itemX.item.metadata.year"
                                        theme="dark"
                                        background="rgba(0, 204, 153, 1)"
                                        fontSize="12"
                                        style="width: 50px; height: 25px; margin: 0px 15px;"
                                    >{{itemX.item.metadata.year}}</fv-button>
                                </div>
                            </template>
                            <template v-slot:extension>
                                <fv-tag
                                    :value="itemX.item.labels"
                                    :theme="theme"
                                    class="tag-block"
                                    style="max-width: 120px; overflow: auto;"
                                    @click.native="$emit('label-click', itemX.item)"
                                ></fv-tag>
                            </template>
                        </fv-collapse>
                    </div>
                </template>
                <template v-slot:footer>
                    <fv-button
                        theme="dark"
                        background="rgba(115, 153, 215, 1)"
                        icon="Download"
                        borderRadius="3"
                        style="width: 100px;"
                        :disabled="!lock"
                        @click="confirm"
                    >{{local('Confirm')}}</fv-button>
                    <fv-button
                        theme="dark"
                        background="rgba(220, 62, 72, 1)"
                        icon="Delete"
                        borderRadius="3"
                        :disabled="currentChoosen.length <= 0"
                        style="width: 100px;"
                        @click="remove"
                    >{{local('Remove')}}</fv-button>
                    <fv-button
                        :theme="theme"
                        borderRadius="3"
                        style="width: 100px;"
                        @click="show.panel = false"
                    >{{local('Close')}}</fv-button>
                </template>
            </fv-panel>
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
            edit: false,
            lock: true,
            show: {
                panel: false,
            },
        };
    },
    watch: {},
    computed: {
        ...mapState({
            data_index: (state) => state.data_index,
            data_path: (state) => state.data_path,
            items: (state) => state.data_structure.items,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            itemCarrier: (state) => state.itemCarrier,
            c: (state) => state.pdfImporter.c,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        currentChoosen() {
            let result = [];
            for (let i = 0; i < this.itemCarrier.itemsX.length; i++) {
                if (this.itemCarrier.itemsX[i].choosen)
                    result.push(this.itemCarrier.itemsX[i]);
            }
            return result;
        },
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            revisePdfImporter: "revisePdfImporter",
            reviseItemCarrier: "reviseItemCarrier",
        }),
        itemChooseClick(itemX) {
            let index = this.itemCarrier.itemsX.indexOf(itemX);
            let t = itemX;
            t.choosen = !t.choosen;
            this.$set(this.itemCarrier.itemsX, index, t);
            this.$emit("change-value", this.itemCarrier.itemsX);
            this.$emit("choose-items", this.currentChoosen);
        },
        remove() {
            this.currentChoosen.forEach((itemX) => {
                let index = this.itemCarrier.itemsX.indexOf(itemX);
                this.itemCarrier.itemsX.splice(index, 1);
            });
            this.reviseItemCarrier({
                itemsX: this.itemCarrier.itemsX,
            });
        },
        async confirm() {
            if (!this.lock) return;
            this.lock = false;

            for (let i = 0; i < this.itemCarrier.itemsX.length; i++) {
                let itemX = this.itemCarrier.itemsX[i];
                let sourceDir = path.join(
                    itemX.path,
                    "root",
                    "items",
                    itemX.id
                );
                let newId = this.$Guid();
                let targetDir = path.join(
                    this.data_path[this.data_index],
                    "root",
                    "items",
                    newId
                );
                ipc.send("ensure-folder", targetDir);
                await new Promise((resolve) => {
                    ipc.on("ensure-folder-callback", () => {
                        resolve(1);
                    });
                });
                if (itemX.item.pdf) {
                    ipc.send("copy-file", {
                        src: path.join(sourceDir, `${itemX.item.pdf}.pdf`),
                        tgt: path.join(targetDir, `${newId}.pdf`),
                    });
                    await new Promise((resolve) => {
                        ipc.on("copy-file-callback", () => {
                            resolve(1);
                        });
                    });
                }
                if (itemX.item.metadata) {
                    ipc.send("copy-file", {
                        src: path.join(sourceDir, `${itemX.id}.metadata`),
                        tgt: path.join(targetDir, `${newId}.metadata`),
                    });
                    await new Promise((resolve) => {
                        ipc.on("copy-file-callback", () => {
                            resolve(1);
                        });
                    });
                }
                itemX.item.id = newId;
                itemX.item.pdf = newId;
                if (itemX.item.pages.length > 0) {
                    for (let j = 0; j < itemX.item.pages.length; j++) {
                        let page = itemX.item.pages[j];
                        let newPageId = this.$Guid();
                        ipc.send("copy-file", {
                            src: path.join(sourceDir, `${page.id}.json`),
                            tgt: path.join(targetDir, `${newPageId}.json`),
                        });
                        await new Promise((resolve) => {
                            ipc.on("copy-file-callback", () => {
                                resolve(1);
                            });
                        });
                        itemX.item.pages[j].id = newPageId;
                    }
                }

                if (!this.ds_db) return;
                let _item = JSON.parse(JSON.stringify(itemX.item));
                _item.createDate = this.$SDate.DateToString(new Date());
                this.items.push(_item);
                this.reviseDS({
                    $index: this.data_index,
                    items: this.items,
                });
                this.copyToPartition(_item);
                this.revisePdfImporter({
                    c: this.c + 1,
                });

                this.$emit(
                    "update-progess",
                    (((i + 1) / this.itemCarrier.itemsX.length) * 100).toFixed(
                        2
                    )
                );
            }

            this.$emit("update-progess", 110);
            this.reviseItemCarrier({
                itemsX: [],
            });
            this.show.panel = false;
            this.lock = true;
        },
        copyToPartition(item) {
            let id = this.$route.params.id;
            if (id === undefined) return;
            let t = [].concat(this.groups);
            let partitions = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            partitions = partitions.concat(this.partitions);
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].id === id) {
                    partitions[i].items.push(item.id);
                }
            }
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
        },
    },
};
</script>

<style lang="scss">
.ikfb-item-carrier {
    position: fixed;
    width: 35px;
    height: 60px;
    top: 35px;
    right: 0px;
    padding: 5px;
    background: rgba(245, 245, 245, 0.6);
    border-radius: 8px;
    color: rgba(36, 36, 36, 1);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    user-select: none;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 2;

    &:hover {
        background: rgba(250, 250, 250, 0.6);
    }

    &:active {
        background: rgba(235, 235, 235, 0.6);
    }

    &.dark {
        background: rgba(90, 90, 90, 0.6);
        color: whitesmoke;

        &:hover {
            background: rgba(120, 120, 120, 0.6);
        }

        &:active {
            background: rgba(50, 49, 48, 0.6);
        }

        &.show {
            background: rgba(90, 90, 90, 0.01);
        }
    }

    &.show {
        top: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        background: rgba(245, 245, 245, 0.01);
        border-radius: 0px;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .carrier-flag {
        @include HcenterVcenter;

        position: relative;
        width: 100%;
        height: 100%;
        user-select: none;
    }

    .panel-container {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 15px 15px 55px 15px;
        color: rgba(28, 30, 41, 1);
        font-family: Akkurat Std, -apple-system, BlinkMacSystemFont, Segoe UI,
            Roboto, Oxygen, Ubuntu, Cantarell, Helvetica Neue, sans-serif;
        font-weight: 400;
        box-sizing: border-box;
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
                overflow: hidden;

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
}
</style>