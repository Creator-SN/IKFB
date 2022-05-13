<template>
    <div
        class="settings-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div class="s-row">
            <p class="s-title">{{local('Setting')}}</p>
        </div>
        <div class="scroll-view">
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'StorageTape'"
                :title="local('Source')"
                :content="local('Add New Source')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 35px;"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        icon="OneDriveAdd"
                        :is-box-shadow="true"
                        style="width: 150px;"
                        @click="addSource"
                    >{{local('Add New Source')}}</fv-button>
                </template>
            </fv-Collapse>
            <div class="s-item-block">
                <fv-list-view
                    :value="thisDBList"
                    :theme="theme"
                    :choosen-background="'rgba(0, 98, 158, 0.1)'"
                    style="width: 100%; height: auto; margin-top: 15px;"
                    @chooseItem="switchDataIndex($event.item)"
                >
                    <template v-slot:listItem="x">
                        <div
                            class="list-view-item"
                            :class="[{choosen: data_index === x.index, disabled: SourceIndexDisabled(x.index)}]"
                        >
                            <img
                                v-if="x.item.path.indexOf('OneDrive') > -1"
                                draggable="false"
                                class="icon-img"
                                :src="img.OneDrive"
                                alt=""
                            >
                            <i
                                v-else
                                class="ms-Icon ms-Icon--Link"
                            ></i>
                            <p class="item-name">{{x.item.name}}</p>
                            <fv-button
                                v-show="x.item.status == 502 || SourceIndexDisabled(x.index)"
                                :theme="theme"
                                class="control-btn"
                                background="rgba(255, 200, 0, 1)"
                                :is-box-shadow="true"
                                :title="local(`Can't find data_structure.json on this source, shall we init new one ?`)"
                                @click="showInitDS(x.index)"
                            >
                                <i class="ms-Icon ms-Icon--EraseTool"></i>
                            </fv-button>
                            <fv-button
                                :theme="theme"
                                class="control-btn"
                                :is-box-shadow="true"
                                :title="local(`Unlink this source`)"
                                @click="removeDS(x.item)"
                            >
                                <i class="ms-Icon ms-Icon--RemoveLink"></i>
                            </fv-button>
                        </div>
                    </template>
                </fv-list-view>
            </div>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'Color'"
                :title="local('Theme')"
                :content="theme === 'light' ? `${local('Light')}` : `${local('Dark')}`"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 15px;"
            >
                <template v-slot:extension>
                    <fv-button
                        :theme="theme"
                        fontSize="16"
                        borderRadius="50"
                        :is-box-shadow="true"
                        style="width: 40px; height: 40px;"
                        :title="theme === 'light' ? `${local('Switch to the dark theme')}` : `${local('Switch to the light theme')}`"
                        @click="toggleTheme(v)"
                    >
                        <i
                            class="ms-Icon"
                            :class="[`ms-Icon--${theme === 'light' ? 'Sunny' : 'ClearNight'}`]"
                        ></i>
                    </fv-button>
                </template>
            </fv-Collapse>
            <fv-Collapse
                :disabledCollapse="true"
                :theme="theme"
                :icon="'LocaleLanguage'"
                :title="local('Language')"
                :content="local('Choose A Language')"
                style="width: calc(100% - 15px); max-width: 1280px; margin-top: 3px;"
            >
                <template v-slot:extension>
                    <fv-Combobox
                        v-model="cur_language"
                        :theme="theme"
                        :options="languages"
                        :placeholder="local('Choose A Language')"
                        :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''"
                        style="width: 120px;"
                        @choose-item="chooseLanguage"
                    ></fv-Combobox>
                </template>
            </fv-Collapse>
        </div>
        <init-ds
            :show.sync="show.initDS"
            :theme="theme"
            :db_index="db_index"
        ></init-ds>
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import initDs from "@/components/settings/initDs.vue";

import OneDrive from "@/assets/settings/OneDrive.svg";

const { dialog } = require("electron").remote;

export default {
    components: {
        initDs,
    },
    data() {
        return {
            cur_language: {},
            languages: [
                { key: "en", text: "English" },
                { key: "cn", text: "简体中文" },
            ],
            thisDBList: [],
            db_index: -1,
            img: {
                OneDrive,
            },
            show: {
                initDS: false,
            },
            lock: {
                switchDataIndex: true,
            },
        };
    },
    watch: {
        $route() {
            this.languageInit();
            this.refreshDBList();
        },
        data_path() {
            this.refreshDBList();
        },
        data_index() {
            this.refreshDBList();
        },
        language() {
            this.languageInit();
        },
        "show.initDS"() {
            this.refreshDBList();
        },
    },
    computed: {
        ...mapState({
            init_status: (state) => state.init_status,
            data_index: (state) => state.data_index,
            data_path: (state) => state.data_path,
            DataDB: (state) => state.DataDB,
            dbList: (state) => state.dbList,
            language: (state) => state.language,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        SourceIndexDisabled() {
            return (index) => {
                if (!this.dbList[index]) return true;
                let id = this.dbList[index].get("id").write();
                return id === null;
            };
        },
    },
    mounted() {
        this.languageInit();
        this.refreshDBList();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseDS: "reviseDS",
            reviseData: "reviseData",
            toggleTheme: "toggleTheme",
            syncDS: "syncDS",
        }),
        languageInit() {
            this.cur_language = this.languages.find(
                (item) => item.key === this.language
            );
        },
        chooseLanguage(item) {
            this.reviseConfig({
                language: item.key,
            });
        },
        refreshDBList() {
            // 此函数初始化数据源的DB //
            // 同时也会初始化ListView列表项目 //
            let pathList = this.data_path;
            if (this.DataDB.status == 404 && !this.init_status) {
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
            let dbXList = this.DataDB.dbXList;
            let thisDBList = [];
            dbXList.forEach((el, idx) => {
                thisDBList.push({
                    key: idx,
                    name: pathList[idx],
                    path: pathList[idx],
                    choosen: idx === this.data_index,
                    status: el.status,
                    msg: el.msg,
                    disabled: () => el.status === 500 || !this.lock.switchDataIndex,
                    db: el.db,
                });
            });
            this.thisDBList.splice(0, this.thisDBList.length);
            this.thisDBList = thisDBList;
        },
        async addSource() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            let pathList = this.data_path;
            if (!pathList.find((url) => url === path)) pathList.push(path);
            await this.reviseConfig({
                data_path: pathList,
            });
            let index = pathList.indexOf(path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        data_index: -1,
                    });
                this.reviseConfig({
                    data_index: index,
                });
            }
        },
        switchDataIndex(item) {
            this.lock.switchDataIndex = false;
            let index = this.data_path.indexOf(item.path);
            this.reviseConfig({
                data_index: index,
            });
            this.lock.switchDataIndex = true;
        },
        showInitDS(db_index) {
            this.db_index = db_index;
            this.show.initDS = true;
        },
        removeDS(db_item) {
            this.$infoBox(
                this.local("Are you sure to remove this data source?"),
                {
                    status: "error",
                    title: this.local("Remove Data Source"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        let url = db_item.path;
                        let index = this.data_path.indexOf(url);
                        this.data_path.splice(index, 1);
                        if (index - 1 > 0 && this.data_path.length > 0)
                            this.reviseConfig({
                                data_index: index - 1,
                            });
                        else if(this.data_path.length > 0)
                            this.reviseConfig({
                                data_index: 0,
                            });
                        else
                            this.reviseConfig({
                                data_index: -1,
                            });
                    },
                    cancel: () => {},
                }
            );
        },
    },
};
</script>

<style lang="scss">
.settings-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: whitesmoke;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark {
        background: rgba(36, 36, 36, 1);

        .s-title {
            color: whitesmoke;
        }

        .scroll-view {
            .s-item-block {
                .s-item-title {
                    color: whitesmoke;
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

    .scroll-view {
        position: relative;
        width: 100%;
        flex: 1;
        padding-left: 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: auto;

        .s-item-block {
            position: relative;
            width: calc(100% - 30px);
            max-width: 1280px;
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title {
                user-select: none;
                cursor: default;
            }

            .list-view-item {
                position: relative;
                width: 100%;
                padding-left: 5px;
                border-left: rgba(0, 98, 158, 0) solid 5px;
                border-radius: 3px;
                display: flex;
                align-items: center;

                &.disabled {
                    filter: grayscale(100%);
                }

                &.choosen {
                    border-color: rgba(0, 98, 158, 0.6);
                }

                .icon-img {
                    width: 16px;
                    height: auto;
                }

                .item-name {
                    margin-left: 15px;
                    font-size: 13px;
                    flex: 1;
                }

                .control-btn {
                    width: 35px;
                    height: 35px;
                    margin-right: 5px;
                }
            }
        }
    }
}
</style>