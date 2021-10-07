<template>
    <web-window-base v-model="thisShow" :title="local('Rename Page')" :theme="theme">
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Page Name')}}</p>
                <fv-text-box v-model="name" :placeholder="local('Input page name...')" :theme="theme" @keyup.enter="rename"></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button theme="dark" background="rgba(0, 153, 204, 1)" :disabled="!value || name === '' || !ds_db" @click="rename">{{local('Confirm')}}</fv-button>
            <fv-button :theme="theme" @click="thisShow = false">{{local('Cancel')}}</fv-button>
        </template>
    </web-window-base>
</template>

<script>
import webWindowBase from "../window/webWindowBase.vue";
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    components: {
        webWindowBase,
    },
    props: {
        value: {
            default: null
        },
        item: {
            default: null
        },
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
            if(this.value.name)
                this.name = this.value.name;
            else
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
        async rename () {
            if(!this.ds_db || !this.value || !this.item || this.name === '')
                return;
            let item = this.items.find(it => it.id === this.item.id);
            let _page = item.pages.find(it => it.id === this.value.id);
            _page.name = this.name;
            this.value.name = this.name;
            this.reviseDS({
                $index: this.data_index,
                items: this.items
            });
            this.thisShow = false;
        }
    },
};
</script>

<style lang="scss">
</style>