<template>
    <div
        id="app"
        :class="{dark: theme == 'dark'}"
    >
        <navigation-view></navigation-view>
        <div class="addition-container">
            <title-bar
                class="title-bar"
                :theme="theme"
                style="background: transparent;"
            ></title-bar>
            <div class="global-container">
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
        <editor-container></editor-container>
        <pdf-importer ref="pdf_importer"></pdf-importer>
        <item-carrier @update-progess="updateProgress"></item-carrier>
        <div
            v-show="show.drop"
            class="file-drop-mask"
            ref="drop"
        ></div>
        <transition name="scale-up-to-up">
            <starter v-if="init_status" @refresh-data-db="dataDBInit"></starter>
        </transition>
        <progress-bar></progress-bar>
    </div>
</template>

<script>
import i18n from "@/js/i18n.js";
import starter from "@/components/general/starter.vue";
import titleBar from "@/components/general/titleBar.vue";
import progressBar from "@/components/general/progressbar.vue";
import navigationView from "@/components/general/navigationView.vue";
import editorContainer from "@/components/general/editorContainer.vue";
import pdfImporter from "@/components/general/pdfImporter.vue";
import itemCarrier from "@/components/general/itemCarrier.vue";
import { config } from "@/js/data_sample";
import { ConfigDB, DataDB } from "@/js/dbManager.js";
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    name: "App",
    components: {
        starter,
        titleBar,
        progressBar,
        navigationView,
        editorContainer,
        pdfImporter,
        itemCarrier,
    },
    data() {
        return {
            show: {
                drop: false,
            },
        };
    },
    watch: {
        $route() {
            this.pdfImporterInit();
        },
        data_path() {
            this.dataDBInit();
        },
    },
    computed: {
        ...mapState({
            init_status: (state) => state.init_status,
            data_path: (state) => state.data_path,
            language: (state) => state.language,
            show_editor: (state) => state.editor.show,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
    },
    mounted() {
        this.configDBInit();
        this.pdfImporterInit();
        this.dropFilesInit();
        this.i18nInit();
        if (this.$route.path !== "/") this.$Go("/");
    },
    methods: {
        ...mapMutations({
            initDB: "initDB",
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            revisePdfImporter: "revisePdfImporter",
            reviseProgress: "reviseProgress",
            reviseI18N: "reviseI18N",
        }),
        i18nInit() {
            this.reviseI18N(i18n);
        },
        configDBInit() {
            let configDB = new ConfigDB();
            this.initDB({ ConfigDB: configDB });
            this.$config_db = configDB.config_db;
            let _config = JSON.parse(JSON.stringify(config));
            for (let key in _config) {
                _config[key] = this.$config_db.get(key).write();
            }
            this.reviseConfig(_config);
        },
        dataDBInit() {
            let pathList = this.data_path;
            let dataDB = new DataDB(pathList);
            this.initDB({
                DataDB: dataDB
            });
            if (dataDB.status == 404 && !this.init_status) {
                this.$barWarning(
                    this.local(
                        "There is no source, please add a data source to getting started."
                    ),
                    {
                        status: "warning",
                        autoClose: -1,
                    }
                );
                return;
            }
            this.reviseData({
                dbList: dataDB.dbList,
            });
        },
        pdfImporterInit() {
            this.revisePdfImporter({
                pdf_importer: this.$refs.pdf_importer,
            });
        },
        dropFilesInit() {
            this.$el.addEventListener(
                "dragenter",
                (e) => {
                    if (!this.show_editor) {
                        this.show.drop = true;
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                false
            );

            this.$el.addEventListener(
                "dragover",
                (e) => {
                    if (!this.show_editor) {
                        this.show.drop = true;
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                false
            );

            this.$el.addEventListener(
                "dragleave",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$refs.drop.addEventListener(
                "dragleave",
                (e) => {
                    this.show.drop = false;
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$el.addEventListener("drop", (e) => {
                if (this.show_editor) return;
                e.preventDefault();
                e.stopPropagation();

                this.show.drop = false;
                var df = e.dataTransfer;
                var files = [];

                if (df.items !== undefined) {
                    for (let i = 0; i < df.items.length; i++) {
                        let item = df.items[i];
                        // 用webkitGetAsEntry禁止上传目录
                        if (
                            item.kind === "file" &&
                            item.webkitGetAsEntry().isFile &&
                            item.type === "application/pdf"
                        ) {
                            let file = item.getAsFile();
                            files.push(file);
                        }
                    }
                }

                this.revisePdfImporter({
                    df: files,
                });
            });
        },
        updateProgress(value) {
            this.reviseProgress(value);
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            this.$Go(path);
        },
    },
};
</script>

<style lang="scss">
#app {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;

        &:hover {
            width: 10px;
        }
    }
    /*定义滚动条轨道
 内阴影+圆角*/
    ::-webkit-scrollbar-track {
        border-radius: 10px;
    }
    /*定义滑块
 内阴影+圆角*/
    ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: rgba(191, 190, 189, 0.3);
        transition: background-color 0.3s;
        cursor: pointer;

        &:hover {
            width: 16px;
            background-color: rgba(191, 190, 189, 1);
        }
    }

    .addition-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;

        .title-bar {
            position: absolute;
            z-index: 10;
        }

        .global-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    }

    .file-drop-mask {
        position: absolute;
        left: 5px;
        top: 5px;
        width: calc(100% - 10px);
        height: calc(100% - 10px);
        background: rgba(200, 200, 200, 0.1);
        border: rgba(200, 200, 200, 0.6) dashed 3px;
        border-radius: 8px;
        box-sizing: border-box;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        overflow: hidden;
        z-index: 6;
    }

    .move-bottom-to-top-enter-active {
        animation: moveFromBottom 0.25s ease both;
    }
    .move-bottom-to-top-leave-active {
        animation: moveToTop 0.25s ease both;
    }
    @keyframes moveFromBottom {
        from {
            transform: translateY(30%);
        }
    }
    @keyframes moveToTop {
        to {
            transform: translateY(-30%);
        }
    }
}
</style>
