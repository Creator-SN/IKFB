<template>
<div class="settings-container" :class="[{dark: theme === 'dark'}]">
    <div class="s-row">
        <p class="s-title">{{local('Setting')}}</p>
    </div>
    <div class="scroll-view">
        <div class="s-item-block">
            <p class="s-item-title">{{local('Source')}}</p>
            <fv-button :theme="theme" icon="OneDriveAdd" style="width: 150px;" @click="addSource">{{local('Add New Source')}}</fv-button>
            <fv-list-view :value="dbList" :theme="theme" style="width: 100%; height: auto; margin-top: 15px;">
                <template v-slot:listItem="x">
                    <div class="list-view-item">
                        <i class="ms-Icon ms-Icon--Link"></i>
                        <p class="item-name">{{x.item.name}}</p>
                        <fv-button v-show="x.item.status == 502" :theme="theme" class="control-btn" background="rgba(255, 200, 0, 1)" :title="local(`Can't find data_structure.json on this source, shall we init new one ?`)" @click="showInitDS(x.item)">
                            <i class="ms-Icon ms-Icon--EraseTool"></i>
                        </fv-button>
                        <fv-button :theme="theme" class="control-btn" @click="removeDS(x.item)">
                            <i class="ms-Icon ms-Icon--RemoveLink"></i>
                        </fv-button>
                    </div>
                </template>
            </fv-list-view>
        </div>
        <div class="s-item-block">
            <p class="s-item-title">{{local('Theme')}}</p>
            <fv-button :theme="theme"
                fontSize="16"
                borderRadius="50"
                style="width: 40px; height: 40px;"
                :title="theme === 'light' ? `${local('Switch to the dark theme')}` : `${local('Switch to the light theme')}`"
                @click="toggleTheme(v)">
                <i class="ms-Icon" :class="[`ms-Icon--${theme === 'light' ? 'Sunny' : 'ClearNight'}`]"></i>
            </fv-button>
        </div>
        <div class="s-item-block">
            <p class="s-item-title">{{local('Language')}}</p>
            <fv-Combobox v-model="cur_language" :theme="theme" :options="languages" placeholder="Choose A Language" :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : ''" @choose-item="chooseLanguage"></fv-Combobox>
        </div>
    </div>
    <init-ds :show.sync="show.initDS" :theme="theme" :db_item="db_item"></init-ds>
</div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import initDs from "@/components/window/initDs.vue";
const { dialog } = require('electron').remote

export default {
    components: {
        initDs
    },
    data () {
        return {
            cur_language: {},
            languages: [
                { key: "en", text: "English" },
                { key: "cn", text: "简体中文" }
            ],
            dbList: [],
            db_item: null,
            show: {
                initDS: false
            }
        }
    },
    watch: {
        language () {
            this.languageInit();
        },
        "show.initDS" () {
            this.dataSourceSync();
        }
    },
    computed: {
        ...mapState({
            data_path: state => state.data_path,
            language: state => state.language,
            theme: (state) => state.theme
        }),
        ...mapGetters([
            'local'
        ]),
        v () {
            return this;
        }
    },
    mounted () {
        this.languageInit();
        this.dataSourceSync();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseDS: "reviseDS",
            reviseData: "reviseData",
            toggleTheme: "toggleTheme"
        }),
        languageInit () {
            this.cur_language = this.languages.find(item => item.key === this.language);
        },
        chooseLanguage (item) {
            this.reviseConfig({
                v: this,
                language: item.key
            })
        },
        dataSourceSync () {
            let urls = this.data_path;
            let db_array_result = this.$load_ds_file(urls);
            if(db_array_result.status == 404) {
                this.$barWarning(this.local('There is no source, please add a data source to getting started.'), {
                    status: 'warning'
                });
                return;
            }
            let db_array = db_array_result.db_array;
            let dbList = [];
            let ds_db_list = [];
            db_array.forEach((el, idx) => {
                dbList.push({
                    key: urls[idx],
                    name: urls[idx],
                    status: el.status,
                    msg: el.msg,
                    disabled: () => el.status === 500,
                    db: el.db
                });
                ds_db_list.push(el.db);
            });
            this.dbList = dbList;
            this.reviseData({
                ds_db_list: ds_db_list
            });
        },
        async addSource () {
            let path = (await dialog.showOpenDialog({
                properties: ['openDirectory']
            })).filePaths[0];
            if(!path)
                return;
            let urls = this.data_path;
            if(!urls.find(url => url === path))
                urls.push(path);
            this.reviseConfig({
                v: this,
                data_path: urls,
            });
            this.dataSourceSync();
        },
        showInitDS (db_item) {
            this.db_item = db_item;
            this.show.initDS = true;
        },
        removeDS (db_item) {
            this.$infoBox(
                this.local("Are you sure to remove this data source?"),
                {
                    status: "error",
                    title: this.local("Remove Data Source"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        let url = db_item.key;
                        let index = this.data_path.indexOf(url);
                        this.data_path.splice(index, 1);
                        this.dataSourceSync();
                    },
                    cancel: () => {
                        
                    },
                }
            );
        }
    }
}
</script>

<style lang="scss">
.settings-container
{
    position: relative;
    width: 100%;
    height: 100%;
    background: whitesmoke;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s;

    &.dark
    {
        background: rgba(36, 36, 36, 1);

        .s-title
        {
            color: whitesmoke;
        }

        .scroll-view
        {
            .s-item-block
            {
                .s-item-title
                {
                    color: whitesmoke;
                }
            }
        }
    }

    .s-row
    {
        position: relative;
        margin: 25px 0px;
        padding: 0px 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }

    .s-title
    {
        font-size: 24px;
        user-select: none;
        cursor: default;
    }

    .scroll-view
    {
        position: relative;
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;

        .s-item-block
        {
            position: relative;
            width: calc(100% - 30px);
            height: auto;
            line-height: 2.5;
            display: flex;
            flex-direction: column;

            .s-item-title
            {
                user-select: none;
                cursor: default;
            }

            .list-view-item
            {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;

                .item-name
                {
                    margin-left: 15px;
                    font-size: 13px;
                    flex: 1;
                }

                .control-btn
                {
                    width: 40px;
                    height: 40px;
                    margin-right: 5px;
                }
            }
        }
    }
}
</style>