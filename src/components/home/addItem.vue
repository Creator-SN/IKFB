<template>
    <web-window-base v-model="thisShow" :title="local('Add Item')" :theme="theme">
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Name')}}</p>
                <fv-text-box v-model="name" :placeholder="local('Input item name...')" :theme="theme"></fv-text-box>
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
import {item} from "@/js/data_sample.js";
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
            items: state => state.data_structure.items,
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
            let _item = JSON.parse(JSON.stringify(item));
            _item.id = this.$Guid();
            _item.name = this.name;
            _item.emoji = '📦';
            _item.createDate = this.$SDate.DateToString(new Date());
            this.items.push(_item);
            this.reviseDS({
                $index: this.data_index,
                items: this.items
            });
            let url = path.join(this.data_path[this.data_index], `root/items/${_item.id}`);
            ipc.send('ensure-folder', url);
            await new Promise(resolve => {
                ipc.on('ensure-folder-callback', () => {
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