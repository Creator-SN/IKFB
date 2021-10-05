<template>
    <fv-panel
        v-model="thisValue"
        :theme="theme"
        width="500"
        :title="local(`Metadata`)"
        :isAcrylic="true"
        :isFooter="true"
    >
        <template v-slot:container>
            <div class="metadata-container">
                <div class="metadata-item">
                    <p class="title">Publisher</p>
                    <fv-text-box
                        v-model="metadata.publisher"
                        :theme="theme"
                        :placeholder="local(`Please Input publisher...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">DOI</p>
                    <fv-text-box
                        v-model="metadata.DOI"
                        :theme="theme"
                        :placeholder="local(`Please Input DOI...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">CreateDate</p>
                    <fv-text-box
                        v-model="metadata.createDate"
                        :theme="theme"
                        :placeholder="local(`Please Input createDate...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Source</p>
                    <fv-text-box
                        v-model="metadata.source"
                        :theme="theme"
                        :placeholder="local(`Please Input source...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Title</p>
                    <fv-text-box
                        v-model="metadata.title"
                        :theme="theme"
                        :placeholder="local(`Please Input title...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Url</p>
                    <fv-text-box
                        v-model="metadata.url"
                        :theme="theme"
                        :placeholder="local(`Please Input url...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">ContainerTitle</p>
                    <fv-text-box
                        v-model="metadata.containerTitle"
                        :theme="theme"
                        :placeholder="local(`Please Input containerTitle...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Abstract</p>
                    <fv-text-box
                        v-model="metadata.abstract"
                        :theme="theme"
                        :placeholder="local(`Please Input abstract...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">ISSN</p>
                    <fv-text-box
                        v-model="metadata.ISSN"
                        :theme="theme"
                        :placeholder="local(`Please Input ISSN...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Language</p>
                    <fv-text-box
                        v-model="metadata.language"
                        :theme="theme"
                        :placeholder="local(`Please Input language...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Authors</p>
                    <fv-button
                        v-show="metadata.authors.length === 0"
                        theme="dark"
                        background="rgba(0, 204, 153, 1)"
                        borderRadius="50"
                        @click="addAuthor(0)"
                    >
                        <i class="ms-Icon ms-Icon--Add"></i>
                    </fv-button>
                    <div
                        v-for="(author, index) in metadata.authors"
                        class="author-block"
                        :key="index"
                    >
                        <fv-button
                            theme="dark"
                            background="rgba(173, 38, 45, 1)"
                            borderRadius="50"
                            class="control-btn"
                            @click="delAuthor(index)"
                        >
                            <i class="ms-Icon ms-Icon--Remove"></i>
                        </fv-button>
                        <fv-text-box
                            v-model="author.first"
                            :placeholder="local('First Name')"
                            :theme="theme"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.last"
                            :placeholder="local('Last Name')"
                            :theme="theme"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.sequence"
                            :placeholder="local('Sequence')"
                            :theme="theme"
                        ></fv-text-box>
                        <fv-button
                            theme="dark"
                            background="rgba(0, 204, 153, 1)"
                            borderRadius="50"
                            class="control-btn"
                            @click="addAuthor(index)"
                        >
                            <i class="ms-Icon ms-Icon--Add"></i>
                        </fv-button>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <fv-button
                theme="dark"
                background="rgba(0, 90, 158, 1)"
                @click="save"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                style="margin-left: 5px;"
                @click="thisValue = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </fv-panel>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import { author } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    props: {
        value: {
            default: false,
        },
        item: {
            default: null,
        },
    },
    data() {
        return {
            thisValue: this.value,
            metadata: {
                publisher: "",
                DOI: "",
                createDate: "",
                source: "",
                title: "",
                url: "",
                containerTitle: "", //一般是会议名称
                abstract: "",
                ISSN: "",
                language: "",
                authors: [],
            },
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit("input", val);
        },
        item() {
            console.log(this.item)
            this.metadataInit();
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
    },
    mounted() {
        this.metadataInit();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        metadataInit() {
            if (!this.item.metadata) return;
            for (let key in this.item.metadata)
                if (this.item.metadata[key] !== null)
                    this.metadata[key] = this.item.metadata[key];
                else this.metadata[key] = "";
            if (!this.item.metadata.authors) this.metadata.authors = [];
        },
        addAuthor(index = 0) {
            this.metadata.authors.splice(
                index,
                0,
                JSON.parse(JSON.stringify(author))
            );
        },
        delAuthor(index) {
            this.metadata.authors.splice(index, 1);
        },
        async save() {
            let item = this.items.find((it) => it.id === this.item.id);
            item.metadata = JSON.parse(JSON.stringify(this.metadata));
            this.item.metadata = JSON.parse(JSON.stringify(this.metadata));
            this.reviseDS({
                $index: this.data_index,
                items: this.items,
            });
            await this.saveMetadata(this.metadata, item.id);
            this.thisValue = false;
        },
        async saveMetadata(_metadata, id = null) {
            if (!id) id = this.item.id;
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${id}/${id}.metadata`
            );
            ipc.send("output-file", {
                path: url,
                data: JSON.stringify(_metadata),
            });
            await new Promise((resolve) => {
                ipc.on("output-file-callback", () => {
                    resolve(1);
                });
            });
        }
    }
};
</script>

<style lang="scss">
.metadata-container
{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    .metadata-item
    {
        @include HstartC;

        position: relative;
        width: 100%;
        padding: 5px 20px;
        box-sizing: border-box;
        line-height: 2;

        .title
        {
            margin: 5px 0px;
            font-size: 12px;
            font-weight: bold;
        }

        .author-block
        {
            @include HcenterVcenter;

            position: relative;
            width: 100%;
            margin: 5px 0px;

            .control-btn
            {
                width: 30px;
                height: 30px;
                flex-shrink: 0;
            }
        }
    }
}
</style>