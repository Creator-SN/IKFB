<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Init New Data Source')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Data Source Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input data source name...')"
                    :theme="theme"
                    @keyup.enter="initDs"
                ></fv-text-box>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 153, 204, 1)"
                :disabled="db_index < 0 || name === ''"
                @click="initDs"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                @click="thisShow = false"
            >{{local('Cancel')}}</fv-button>
        </template>
    </float-window-base>
</template>

<script>
import floatWindowBase from "../window/floatWindowBase.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure } from "@/js/data_sample.js";

export default {
    components: {
        floatWindowBase,
    },
    props: {
        show: {
            default: false,
        },
        db_index: {
            default: null,
        },
    },
    data() {
        return {
            thisShow: this.show,
            name: "",
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            this.name = "";
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            language: (state) => state.language,
            dbList: (state) => state.dbList,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local"]),
        v() {
            return this;
        },
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        initDs() {
            if (this.db_index < 0 || this.name === "") return;
            if (!this.data_path[this.db_index]) return;
            this.init_ds(this.$Guid(), this.name);
            this.thisShow = false;
        },
        init_ds(id, name) {
            let ds = JSON.parse(JSON.stringify(data_structure));
            ds.id = id;
            ds.name = name;
            ds.createDate = this.$SDate.DateToString(new Date());
            this.reviseDS({
                $index: this.db_index,
                ...ds
            });
        },
    },
};
</script>

<style lang="scss">
</style>