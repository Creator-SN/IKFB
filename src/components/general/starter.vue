<template>
    <div class="ikfb-starter-container">
        <fv-button
            v-show="step > 1"
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
                    @click="step = 2"
                >{{local('Exists Data Source')}}</fv-button>
            </div>
        </transition>
        <transition name="scale-up-to-up">
            <div
                v-show="step === 2"
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
            path: "",
            name: "",
        };
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            ds_db_list: (state) => state.ds_db_list,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        SourceIndexDisabled() {
            return (index) => {
                if (!this.ds_db_list[index]) return true;
                let id = this.ds_db_list[index].get("id").write();
                return id === null;
            };
        },
    },
    mounted() {},
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseData: "reviseData",
            reviseDS: "reviseDS",
        }),
        async choosePath() {
            let path = (
                await dialog.showOpenDialog({
                    properties: ["openDirectory"],
                })
            ).filePaths[0];
            if (!path) return;
            this.path = path;
        },
        async dataSourceSync() {
            let pathList = this.data_path;
            let db_array_result = this.$load_ds_file(pathList);
            if (db_array_result.status == 404) {
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
            let db_array = db_array_result.db_array;
            let ds_db_list = [];
            db_array.forEach((el) => {
                ds_db_list.push(el.db);
            });
            await this.reviseData({
                ds_db_list: ds_db_list,
            });
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
                v: this,
                data_path: pathList,
            });
            this.dataSourceSync();
            let index = pathList.indexOf(_path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        v: this,
                        data_index: -1,
                    });
                this.reviseConfig({
                    v: this,
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
            this.close();
        },
        async chooseSource() {
            if (this.path === "") return;
            let _path = this.path;
            let pathList = this.data_path;
            if (!pathList.find((url) => url === _path)) pathList.push(_path);
            await this.reviseConfig({
                v: this,
                data_path: pathList,
            });
            this.dataSourceSync();
            let index = pathList.indexOf(_path);
            if (!this.SourceIndexDisabled(index)) {
                if (this.data_index === index)
                    await this.reviseConfig({
                        v: this,
                        data_index: -1,
                    });
                this.reviseConfig({
                    v: this,
                    data_index: index,
                });
            }
            this.close();
        },
        close() {
            this.reviseConfig({
                v: this,
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