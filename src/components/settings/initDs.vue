<template>
    <web-window-base v-model="thisShow" :title="local('Init New Data Source')" :theme="theme">
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Data Source Name')}}</p>
                <fv-text-box v-model="name" :placeholder="local('Input data source name...')" :theme="theme" @keyup.enter="initDs"></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button theme="dark" background="rgba(0, 153, 204, 1)" :disabled="!db_item || name === ''" @click="initDs">{{local('Confirm')}}</fv-button>
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
        show: {
            default: false
        },
        db_item: {
            default: null
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
            data_path: (state) => state.data_path,
            language: (state) => state.language,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
        v() {
            return this;
        },
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
        }),
        initDs () {
            if(!this.db_item || this.name === "")
                return;
            this.$init_ds(this.$Guid(), this.name, this.db_item.db);
            this.thisShow = false;
        }
    },
};
</script>

<style lang="scss">
</style>