<template>
    <div class="ikfb-starter-container">
        <fv-button
            v-show="step > 2"
            theme="dark"
            background="rgba(29, 85, 125, 1)"
            :border-radius="50"
            class="left"
            style="width: 30px; height: 30px;"
            @click="step > 0 ? step-- : step"
        ><i class="ms-Icon ms-Icon--ChevronLeftMed"></i></fv-button>
        <fv-button
            theme="dark"
            background="rgba(29, 85, 125, 1)"
            :border-radius="50"
            class="right"
            style="width: 80px; height: 30px;"
            @click="close"
        >{{local('Skip')}}</fv-button>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 0"
                class="item-block"
            >
                <fv-img
                    :src="logo"
                    style="width: 80px; height: auto;"
                ></fv-img>
                <p class="logo-title">IFKB</p>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    class="starter-btn"
                    @click="step++"
                >{{local('Start')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 1"
                class="item-block"
            >
                <p class="title">{{local(`Choose Language`)}}</p>
                <fv-Combobox
                    v-model="cur_language"
                    theme="dark"
                    :options="languages"
                    :placeholder="local('Choose A Language')"
                    background="rgba(36, 36, 36, 1)"
                    @choose-item="chooseLanguage"
                ></fv-Combobox>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    class="starter-btn"
                    style="margin-top: 15px;"
                    @click="step++"
                >{{local('Confirm')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 2"
                class="item-block"
            >
                <p class="title">{{local(`New Data Dource`)}}</p>
                <fv-text-box
                    v-model="path"
                    :placeholder="local('Click Me to Choose Data Source Path ...')"
                    theme="dark"
                    background="rgba(29, 85, 125, 1)"
                    :reveal-border="true"
                    readonly
                    @click.native="choosePath"
                ></fv-text-box>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Data Source Name')"
                    theme="dark"
                    background="rgba(63, 88, 101, 1)"
                    :reveal-border="true"
                    style="margin-top: 5px; margin-bottom: 15px;"
                ></fv-text-box>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    :disabled="path === '' || name === ''"
                    class="starter-btn"
                    @click="addSource"
                >{{local('Confirm')}}</fv-button>
                <fv-button
                    theme="dark"
                    background="rgba(29, 85, 125, 1)"
                    class="starter-btn"
                    @click="step = 3"
                >{{local('Exists Data Source')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 3"
                class="item-block"
            >
                <p class="title">{{local(`Choose from Exists`)}}</p>
                <fv-text-box
                    v-model="path"
                    :placeholder="local('Click Me to Choose Data Source Path ...')"
                    theme="dark"
                    background="rgba(29, 85, 125, 1)"
                    :reveal-border="true"
                    readonly
                    @click.native="choosePath"
                    style="margin-bottom: 15px;"
                ></fv-text-box>
                <fv-button
                    theme="dark"
                    background="rgba(0, 130, 180, 1)"
                    :disabled="path === ''"
                    class="starter-btn"
                    @click="chooseSource"
                >{{local('Confirm')}}</fv-button>
            </div>
        </transition>
    </div>
</template>

<script>
import logo from "../../assets/logo.svg";
import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure } from "@/js/data_sample.js";

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("electron").remote;
const path = require("path");

export default {
    data() {
        return {
            logo: logo,
            step: 0,
            cur_language: {},
            languages: [
                { key: "en", text: "English" },
                { key: "cn", text: "简体中文" },
            ],
            path: "",
            name: "",
        };
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            DataDB: (state) => state.DataDB,
            dbList: (state) => state.dbList,
            language: (state) => state.language,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
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
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            reviseDS: "reviseDS",
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
        async choosePath() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            this.path = path;
        },
        async addSource() {
            if (this.path === "") return;
            if (this.name === "") return;
            let _path = path.join(this.path, this.name);
            ipc.send("ensure-folder", _path);
            await new Promise((resolve) => {
                ipc.on("ensure-folder-callback", () => {
                    resolve(1);
                });
            });
            let pathList = this.data_path;
            if (!pathList.find((url) => url === _path)) pathList.push(_path);
            await this.reviseConfig({
                data_path: pathList,
            });
            let index = pathList.indexOf(_path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        data_index: -1,
                    });
                this.reviseConfig({
                    data_index: index,
                });
            }

            let ds = JSON.parse(JSON.stringify(data_structure));
            ds.id = this.$Guid();
            ds.name = this.name;
            ds.createDate = this.$SDate.DateToString(new Date());
            await this.reviseDS({
                $index: index,
                ...ds,
            });
            this.$emit('refresh-data-db');
            this.close();
        },
        async chooseSource() {
            if (this.path === "") return;
            let _path = this.path;
            let pathList = this.data_path;
            if (!pathList.find((url) => url === _path)) pathList.push(_path);
            await this.reviseConfig({
                data_path: pathList,
            });
            let index = pathList.indexOf(_path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        data_index: -1,
                    });
                this.reviseConfig({
                    data_index: index,
                });
            }
            this.close();
        },
        close() {
            this.reviseConfig({
                init_status: false,
            });
        },
    },
};
</script>

<style lang="scss">
.ikfb-starter-container {
    @include HcenterVcenter;

    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: rgba(29, 84, 125, 0.8);
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(50px);
    z-index: 6;

    .left {
        position: absolute;
        left: 15px;
        top: 65px;
        z-index: 2;
    }

    .right {
        position: absolute;
        right: 15px;
        top: 65px;
        z-index: 2;
    }

    .item-block {
        @include HcenterVcenterC;

        position: absolute;
        width: 100%;
        height: 100%;
        line-height: 2;

        .logo-title {
            margin-bottom: 25px;
            font-size: 20px;
            color: whitesmoke;
        }

        .title {
            margin-bottom: 25px;
            font-size: 20px;
            color: whitesmoke;
        }

        .starter-btn {
            width: 150px;
            height: 40px;
            margin-bottom: 5px;
        }
    }
}
</style>