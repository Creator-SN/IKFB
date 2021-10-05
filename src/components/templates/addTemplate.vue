<template>
    <web-window-base v-model="thisShow" :title="local('Add Template')" :theme="theme">
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Template Name')}}</p>
                <fv-text-box v-model="name" :placeholder="local('Input template name...')" :theme="theme"></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button theme="dark" background="rgba(0, 153, 204, 1)" :disabled="name === '' || !ds_db" @click="add">{{local('Confirm')}}</fv-button>
            <fv-button :theme="theme" @click="thisShow = false">{{local('Cancel')}}</fv-button>
        </template>
    </web-window-base>
</template>

<script>
import webWindowBase from "../window/webWindowBase.vue";
import {page} from "@/js/data_sample.js";
import { mapMutations, mapState, mapGetters } from "vuex";
const { ipcRenderer: ipc } = require("electron");
const path = require("path");

export default {
    components: {
        webWindowBase,
    },
    props: {
        show: {
            default: false
        }
    },
    data() {
        return {
            thisShow: this.show,
            name: ""
        };
    },
    watch: {
        show (val) {
            this.thisShow = val;
        },
        thisShow (val) {
            this.$emit("update:show", val);
            this.name = "";
        }
    },
    computed: {
        ...mapState({
            data_index: (state) => state.data_index,            
            data_path: (state) => state.data_path,
            templates: state => state.data_structure.templates,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", 'ds_db']),
        v() {
            return this;
        },
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        async add () {
            if(!this.ds_db || this.name === '')
                return;
            let _page = JSON.parse(JSON.stringify(page));
            _page.id = this.$Guid();
            _page.name = this.name;
            _page.emoji = '📑';
            _page.createDate = this.$SDate.DateToString(new Date());
            this.templates.push(_page);
            this.reviseDS({
                $index: this.data_index,
                templates: this.templates
            });
            let url = path.join(this.data_path[this.data_index], 'root/templates', `${_page.id}.json`);
            ipc.send('output-file', {
                path: url,
                data: ""
            });
            await new Promise(resolve => {
                ipc.on('output-file-callback', () => {
                    resolve(1);
                });
            })
            this.thisShow = false;
        }
    },
};
</script>

<style lang="scss">
</style>