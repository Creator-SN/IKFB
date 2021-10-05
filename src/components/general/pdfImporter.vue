<template>
    <div
        v-show="thisValue"
        class="ikfb-pdf-importer"
        :class="[{dark: theme == 'dark'}]"
    >
        <input
            type="file"
            :multiple="mode === 'import'"
            accept=".pdf"
            ref="input"
            @change="getPDFData"
        >
        <div class="line">
            {{local('Processing PDF')}}
        </div>
        <div class="line">
            <p>path</p>
        </div>
        <div class="line">
            <fv-progress-bar></fv-progress-bar>
        </div>
        <div class="line">
            <fv-button>{{local('Cancel')}}</fv-button>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import { metadata, author } from "@/js/data_sample.js";
import Extractor from "@/js/extractTitle.js";

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
        mode: {
            default: "item",
        },
    },
    data() {
        return {
            thisValue: this.value,
            extractor: Extractor,
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            this.$emit("input", val);
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
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        inputInspectClick() {
            if(!this.item) return;
            this.$refs.input.click();
        },
        async getPDFData() {
            if(!this.item) return;
            if (this.$refs.input.files.length === 0) return;
            for (let i = 0; i < this.$refs.input.files.length; i++) {
                let file = this.$refs.input.files[i];
                let _metadata = await this.getTitleMetadata(file);
                let item = this.items.find((it) => it.id === this.item.id);
                item.pdf = `${item.id}`;
                item.metadata = _metadata;
                this.reviseDS({
                    $index: this.data_index,
                    items: this.items,
                });
                await this.copyPdf(file.path);
                await this.saveMetadata(_metadata);
            }
        },
        async copyPdf(objURL) {
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${this.item.id}/${this.item.id}.pdf`
            );
            ipc.send("copy-file", {
                src: objURL,
                tgt: url,
            });
            await new Promise((resolve) => {
                ipc.on("copy-file-callback", () => {
                    resolve(1);
                });
            });
        },
        async saveMetadata(_metadata) {
            let url = path.join(
                this.data_path[this.data_index],
                "root/items",
                `${this.item.id}/${this.item.id}.metadata`
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
        async getTitleMetadata(file) {
            this.extractor.PDFJS = this.$PDFJS;
            let title = await this.extractor.getTitle(
                URL.createObjectURL(file)
            );
            let pdfMetadata = await this.extractor.getMetadata(
                URL.createObjectURL(file)
            );
            title = pdfMetadata.title ? pdfMetadata.title : title;
            let crefInfo = await this.cref_getInfoByTitle(title);
            let _metadata = JSON.parse(JSON.stringify(metadata));
            _metadata.title = title;
            if (pdfMetadata.Author.indexOf(" ; ") > -1) {
                let authors = [];
                let authors_str = pdfMetadata.Author.split(" ; ");
                authors_str.forEach((el, idx) => {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = el.split(" ")[0];
                    _author.last =
                        el.split(" ").length > 1 ? el.split(" ")[1] : "";
                    _author.sequence = idx;
                    authors.push(_author);
                });
                _metadata.authors = authors;
            }
            for (let it of crefInfo) {
                if (it.title[0] === title) {
                    let authors = [];
                    _metadata.DOI = it.DOI;
                    _metadata.abstract = it.abstract;
                    _metadata.ISSN = it.ISSN ? it.ISSN[0] : "";
                    _metadata.containerTitle = it["container-title"]
                        ? it["container-title"][0]
                        : "";
                    _metadata.createDate = it.created
                        ? it.created["date-time"]
                        : "";
                    _metadata.language = it.language;
                    _metadata.publisher = it.publisher;
                    _metadata.source = it.source;
                    _metadata.url = it.URL;
                    it.author.forEach((el) => {
                        let _author = JSON.parse(JSON.stringify(author));
                        _author.first = el.first;
                        _author.last = el.last;
                        _author.sequence = el.sequence;
                        authors.push(_author);
                    });
                    _metadata.authors = authors;
                }
            }
            return _metadata;
        },
        async cref_getInfoByTitle(title) {
            let baseUrl = "https://api.crossref.org/works";
            title = title.replace(/ +/g, "+");
            try {
                return await new Promise((resolve) => {
                    this.axios
                        .get(baseUrl, {
                            params: {
                                "query.bibliographic": title,
                            },
                        })
                        .then((response) => {
                            resolve(response.data.message.items);
                        });
                });
            } catch (e) {
                return [];
            }
        },
    },
};
</script>

<style lang="scss">
.ikfb-pdf-importer {
    position: fixed;
    width: 350px;
    height: auto;
    top: 60px;
    right: 15px;
    background: rgba(0, 120, 212, 1);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    box-shadow: 10px 3px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    z-index: 2;

    &.dark {
    }

    .line {
        @include Vcenter;

        position: relative;
        width: 100%;
        height: auto;
        padding: 0px 15px;
        box-sizing: border-box;
    }
}
</style>