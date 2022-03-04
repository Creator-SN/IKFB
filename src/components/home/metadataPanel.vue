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
                    <p class="title">Title</p>
                    <div class="row-block">
                        <fv-text-box
                            v-model="metadata.title"
                            :theme="theme"
                            :placeholder="local(`Please Input title...`)"
                            :underline="true"
                            style="height: 45px; font-size: 20px; flex: 1;"
                            @keyup.enter="getMetaInfo"
                        ></fv-text-box>
                        <fv-button
                            :theme="theme"
                            style="width: 35px; height: 35px; margin-left: 15px;"
                            :title="local('Retrieve Metadata')"
                            @click="getMetaInfo"
                        >
                            <i
                                class="ms-Icon ms-Icon--Sync"
                                :class="[{circle: !lock.metaInfo}]"
                            ></i>
                        </fv-button>
                    </div>
                </div>
                <div
                    v-show="metaInfoList.length > 0"
                    class="metadata-item"
                >
                    <div class="row-block between">
                        <p class="title">{{local('Searching Metadata')}}</p>
                        <fv-button
                            theme="dark"
                            borderRadius="35"
                            background="rgba(220, 62, 72, 1)"
                            style="width: 30px; height: 30px;"
                            @click="metaInfoList = []"
                        >
                            <i class="ms-Icon ms-Icon--Cancel"></i>
                        </fv-button>
                    </div>
                    <transition-group
                        tag="div"
                        name="move-left-to-right"
                        style="position:relative; width: 100%;"
                    >
                        <div
                            v-for="(item, index) in metaInfoList"
                            class="meta-item"
                            :key="`${item.title}-${index}`"
                        >
                            <div class="title-block">
                                <i class="ms-Icon ms-Icon--RightDoubleQuote"></i>
                                <p
                                    class="highlight"
                                    :title="item.title"
                                    @click="updateMetadata(item)"
                                >{{item.title}}</p>
                            </div>
                            <div class="label-block">
                                <fv-button
                                    theme="dark"
                                    background="rgba(145, 145, 235, 1)"
                                    style="flex-shrink: 0;"
                                >{{item.year}}</fv-button>
                                <fv-button
                                    v-show="item.publisher"
                                    theme="dark"
                                    background="rgba(0, 145, 235, 1)"
                                    style="width: auto; margin: 0px 5px;"
                                    :title="item.publisher"
                                >
                                    <p style="padding: 0px 15px;">{{item.publisher}}</p>
                                </fv-button>
                            </div>
                            <div class="extension-block">
                                <p>{{item.from}}</p>
                                <fv-button
                                    theme="dark"
                                    borderRadius="35"
                                    fontSize="12"
                                    style="width: 30px; height: 30px;"
                                    @click="() => {
                                    item.expand ^= true;
                                    $set(metaInfoList, index, item);
                                }"
                                ><i
                                        class="ms-Icon"
                                        :class="[`ms-Icon--${item.expand ? 'DoubleChevronUp' : 'DoubleChevronDown'}`]"
                                    ></i></fv-button>
                            </div>
                            <transition :name="item.expand ? 'move-top-to-bottom' : 'move-bottom-to-top'">
                                <div
                                    v-show="item.expand"
                                    class="abstract-block"
                                >
                                    <span>{{item.abstract}}</span>
                                </div>
                            </transition>
                        </div>
                    </transition-group>
                </div>
                <div class="metadata-item">
                    <p class="title">BibTex Tools</p>
                    <div class="row-block">
                        <fv-combobox
                            v-model="bibTexValue"
                            :placeholder="local(`Select Type`)"
                            :options="bibTexOptions"
                            style="width: 200px;"
                        ></fv-combobox>
                        <fv-button
                            :theme="theme"
                            :disabled="!bibTexValue.key"
                            :isBoxShadow="true"
                            icon="SemiboldWeight"
                            style="width: 135px; height: 35px; margin-left: 15px;"
                            @click="generateBibTex"
                        >
                            {{local('Generate BibTex')}}
                        </fv-button>
                    </div>
                    <textarea
                        v-show="bibTexContent"
                        v-model="bibTexContent"
                        class="text-area"
                        :class="{dark: theme == 'dark'}"
                        :placeholder="local(`BibTex Content`)"
                        style="width: 100%; margin: 5px 0px; font-size: 12px;"
                    ></textarea>
                </div>
                <div class="metadata-item">
                    <p class="title">Publisher</p>
                    <fv-text-box
                        v-model="metadata.publisher"
                        :theme="theme"
                        :placeholder="local(`Please Input publisher...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Year</p>
                    <fv-text-box
                        v-model="metadata.year"
                        :theme="theme"
                        :placeholder="local(`Please Input year...`)"
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
                    <textarea
                        v-model="metadata.abstract"
                        class="text-area"
                        :class="{dark: theme == 'dark'}"
                        :placeholder="local(`Please Input abstract...`)"
                    ></textarea>
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
                    <p class="title">Chapter</p>
                    <fv-text-box
                        v-model="metadata.chapter"
                        :theme="theme"
                        :placeholder="local(`Please Input chapter...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Pages</p>
                    <fv-text-box
                        v-model="metadata.pages"
                        :theme="theme"
                        :placeholder="local(`Please Input pages...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">Note</p>
                    <fv-text-box
                        v-model="metadata.note"
                        :theme="theme"
                        :placeholder="local(`Please Input note...`)"
                    ></fv-text-box>
                </div>
                <div class="metadata-item">
                    <p class="title">School</p>
                    <fv-text-box
                        v-model="metadata.school"
                        :theme="theme"
                        :placeholder="local(`Please Input school...`)"
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
                            style="margin: 0px 3px;"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.last"
                            :placeholder="local('Last Name')"
                            :theme="theme"
                            style="margin: 0px 3px;"
                        ></fv-text-box>
                        <fv-text-box
                            v-model="author.sequence"
                            :placeholder="local('Sequence')"
                            :theme="theme"
                            style="margin: 0px 3px;"
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
import { clipboard } from "electron";
import { mapMutations, mapState, mapGetters } from "vuex";
import { META_API } from "@/js/meta_api.js";
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
            metaAPI: META_API,
            metaInfoList: [],
            metadata: {
                publisher: "",
                DOI: "",
                year: "",
                createDate: "",
                source: "",
                title: "",
                url: "",
                containerTitle: "", //一般是会议名称
                abstract: "",
                ISSN: "",
                language: "",
                chapter: "",
                pages: "",
                school: "",
                note: "",
                authors: [],
            },
            bibTexValue: {},
            bibTexOptions: [
                {
                    key: "article",
                    text: "Article",
                    required: {
                        author: "author",
                        title: "title",
                        journal: "publisher",
                        year: "year",
                    },
                },
                {
                    key: "book",
                    text: "Book",
                    required: {
                        author: "author",
                        title: "title",
                        publisher: "publisher",
                        year: "year",
                    },
                },
                {
                    key: "booklet",
                    text: "Booklet",
                    required: {
                        title: "title",
                    },
                },
                {
                    key: "inbook",
                    text: "Inbook",
                    required: {
                        author: "author",
                        title: "title",
                        publisher: "publisher",
                        year: "year",
                        chapter: "chapter",
                        pages: "pages",
                    },
                },
                {
                    key: "incollection",
                    text: "Incollection",
                    required: {
                        author: "author",
                        title: "title",
                        publisher: "publisher",
                        year: "year",
                        booktitle: "containerTitle",
                    },
                },
                {
                    key: "conference",
                    text: "Conference",
                    required: {
                        author: "author",
                        title: "title",
                        publisher: "publisher",
                        year: "year",
                        booktitle: "containerTitle",
                    },
                },
                {
                    key: "inproceedings",
                    text: "Inproceedings",
                    required: {
                        author: "author",
                        title: "title",
                        publisher: "publisher",
                        year: "year",
                        booktitle: "containerTitle",
                    },
                },
                {
                    key: "manual",
                    text: "Manual",
                    required: {
                        title: "title",
                    },
                },
                {
                    key: "mastersthesis",
                    text: "Mastersthesis",
                    required: {
                        author: "author",
                        title: "title",
                        school: "school",
                        year: "year",
                    },
                },
                {
                    key: "misc",
                    text: "Misc",
                    required: {
                        title: "title",
                    },
                },
                {
                    key: "phdthesis",
                    text: "Phdthesis",
                    required: {
                        author: "author",
                        title: "title",
                        school: "school",
                        year: "year",
                    },
                },
                {
                    key: "proceedings",
                    text: "Proceedings",
                    required: {
                        title: "title",
                        year: "year",
                    },
                },
                {
                    key: "techreport",
                    text: "Techreport",
                    required: {
                        author: "author",
                        title: "title",
                        institution: "publisher",
                        year: "year",
                    },
                },
                {
                    key: "unpublished",
                    text: "Unpublished",
                    required: {
                        author: "author",
                        title: "title",
                        note: "note",
                    },
                },
            ],
            bibTexContent: "",
            lock: {
                metaInfo: true,
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
            // console.log(this.item)
            this.metadataInit();
            this.metaInfoList = [];
            this.lock.metaInfo = true;
            this.bibTexContent = "";
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
            for (let key in this.metadata) {
                if (this.item.metadata[key]) {
                    if (typeof this.item.metadata[key] === "object")
                        this.metadata[key] = this.item.metadata[key];
                    else
                        this.metadata[key] = this.item.metadata[key].toString();
                } else this.metadata[key] = "";
            }
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
        async getMetaInfo() {
            if (!this.lock.metaInfo) return;
            if (!this.metadata.title) return;

            this.lock.metaInfo = false;

            let p = [];
            let fn = [
                this.metaAPI.cref_getInfoByTitle,
                this.metaAPI.semanticScholar_getInfoByTitle,
            ];
            for (let f of fn) {
                p.push(f(this.metadata.title, this.axios));
            }
            let result = [];
            await Promise.all(p).then((res) => {
                res.forEach((it) => {
                    result = result.concat(it);
                });
            });

            result.sort((a, b) => {
                return (
                    this.metaAPI.titleSimilar(b.title, this.metadata.title) -
                    this.metaAPI.titleSimilar(a.title, this.metadata.title)
                );
            });

            this.metaInfoList = result;
            this.lock.metaInfo = true;
        },
        updateMetadata(item) {
            Object.assign(this.metadata, item);
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
        },
        generateBibTex() {
            let required = this.bibTexValue.required;
            let result = {};
            for (let key in required) {
                if (key == "author") {
                    if (!this.metadata.authors.length > 0) {
                        this.$barWarning(
                            `'${key}' ${this.local("is required")}`,
                            {
                                status: "warning",
                            }
                        );
                        return;
                    }
                    this.metadata.authors.forEach((it) => {
                        let name = `${it.last}, ${it.first}`;
                        if (result.name) result.name += ` and ${name}`;
                        else result.name = name;
                    });
                } else {
                    if (!this.metadata[required[key]]) {
                        this.$barWarning(
                            `'${required[key]}' ${this.local("is required")}`,
                            {
                                status: "warning",
                            }
                        );
                        return;
                    }
                    result[key] = this.metadata[required[key]];
                }
            }

            let midContent = () => {
                let r = "";
                for (let key in result) {
                    r += `${key} = {${result[key]}},\n`;
                }
                return r;
            };
            let bib = `@${this.bibTexValue.key} {ikfb${this.$Guid()},
                ${midContent()}
            }`;

            this.bibTexContent = bib;

            clipboard.writeText(bib);
            this.$barWarning(this.local("Successfully copied to clipboard"), {
                status: "correct",
            });
        },
    },
};
</script>

<style lang="scss">
.metadata-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    .metadata-item {
        @include HstartC;

        position: relative;
        width: 100%;
        padding: 5px 20px;
        box-sizing: border-box;
        line-height: 2;

        .title {
            margin: 5px 0px;
            font-size: 12px;
            font-weight: bold;
        }

        .row-block {
            @include Vcenter;

            width: 100%;

            &.between {
                justify-content: space-between;
            }
        }

        .circle {
            animation: circle 1s infinite linear;
        }

        @keyframes circle {
            from {
                transform: rotate(0);
            }
            to {
                transform: rotate(360deg);
            }
        }

        .meta-item {
            width: 100%;
            min-height: 55px;
            height: auto;
            padding: 0px 15px;
            font-size: 13.8px;
            font-weight: 600;
            border: rgba(200, 200, 200, 0.1) solid thin;
            border-radius: 8px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
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

            .title-block {
                @include Vcenter;

                width: 100%;
                margin: 8px 0px;
                overflow: hidden;

                i {
                    font-size: 36px;
                }

                p {
                    margin: 0px 12px;
                    font-size: 13px;
                }
            }

            .label-block {
                @include Vcenter;

                width: 100%;
                margin: 8px 0px;
                overflow-x: auto;

                p {
                    @include nowrap;
                }
            }

            .extension-block {
                @include HbetweenVcenter;

                width: 100%;
                margin: 8px 0px;

                p {
                    font-size: 12px;
                    font-weight: normal;
                    color: rgba(75, 75, 75, 0.8);
                }
            }

            .abstract-block {
                width: 100%;
                margin: 8px 0px;
                font-size: 16px;
                font-family: "Times New Roman", Times, serif;
            }

            p {
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

        .text-area {
            position: relative;
            width: 300px;
            height: 250px;
            padding: 5px;
            font-size: 16px;
            font-family: "Times New Roman", Times, serif;
            box-sizing: border-box;
            border: 1px solid rgba(36, 36, 36, 0.1);
            border-radius: 5px;
            resize: none;
            outline: none;
            line-height: 1.5;

            &.dark {
                background: transparent;
                border: 1px solid rgba(75, 75, 75, 0.8);
            }
        }

        .author-block {
            @include HcenterVcenter;

            position: relative;
            width: 100%;
            margin: 5px 0px;

            .control-btn {
                width: 30px;
                height: 30px;
                flex-shrink: 0;
            }
        }
    }
}
</style>