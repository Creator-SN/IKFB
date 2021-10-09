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
                <transition name="scale-up-to-up" :duration="200">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
        <editor-container></editor-container>
        <pdf-importer ref="pdf_importer"></pdf-importer>
        <div
            v-show="show.drop"
            class="file-drop-mask"
            ref="drop"
        ></div>
    </div>
</template>

<script>
import i18n from "@/js/i18n.js";
import titleBar from "@/components/general/titleBar.vue";
import navigationView from "@/components/general/navigationView.vue";
import editorContainer from "@/components/general/editorContainer.vue";
import pdfImporter from "@/components/general/pdfImporter.vue";
import { config } from "@/js/data_sample";
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    name: "App",
    components: {
        titleBar,
        navigationView,
        editorContainer,
        pdfImporter,
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
            this.syncConfig();
            this.syncDSDB();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            language: (state) => state.language,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
    },
    mounted() {
        this.syncConfig();
        this.syncDSDB();
        this.pdfImporterInit();
        this.dropFilesInit();
        this.i18nInit();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            revisePdfImporter: "revisePdfImporter",
            reviseI18N: "reviseI18N",
        }),
        i18nInit() {
            this.reviseI18N(i18n);
        },
        syncConfig() {
            let _config = JSON.parse(JSON.stringify(config));
            for (let key in _config) {
                _config[key] = this.$config_db.get(key).write();
                if (_config[key] == undefined) {
                    let object = {
                        v: this,
                    };
                    object[key] = config[key];
                    this.reviseConfig(object);
                } else {
                    let object = {
                        v: this,
                    };
                    object[key] = _config[key];
                    this.reviseConfig(object);
                }
            }
        },
        syncDSDB() {
            let pathList = this.data_path;
            let db_array_result = this.$load_ds_file(pathList);
            if (db_array_result.status == 404) {
                this.$barWarning(
                    this.local(
                        "There is no source, please add a data source to getting started."
                    ),
                    {
                        status: "warning",
                    }
                );
                return;
            }
            let db_array = db_array_result.db_array;
            let ds_db_list = [];
            db_array.forEach((el) => {
                ds_db_list.push(el.db);
            });
            this.reviseData({
                ds_db_list: ds_db_list,
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
                    this.show.drop = true;
                    e.preventDefault();
                    e.stopPropagation();
                },
                false
            );

            this.$el.addEventListener(
                "dragover",
                (e) => {
                    this.show.drop = true;
                    e.preventDefault();
                    e.stopPropagation();
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
