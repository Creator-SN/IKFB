<template>
    <float-window-base
        v-model="thisShow"
        :title="local('Rename Item')"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Name')}}</p>
                <fv-text-box
                    v-model="name"
                    :placeholder="local('Input item name...')"
                    :theme="theme"
                    @keyup.enter="confirm"
                ></fv-text-box>
            </div>
            <div class="w-p-block">
                <p class="w-title">{{local('Item Labels')}}</p>
            </div>
            <div class="w-p-row">
                <fv-check-box
                    v-model="item.check"
                    v-for="(item, index) in colorList"
                    :key="index"
                    :border-color="item.color"
                    :background="item.color"
                    @click="chooseColor(index)"
                ></fv-check-box>
            </div>
            <div class="w-p-block">
                <fv-text-box
                    v-model="label"
                    :placeholder="local('New item label (Press Enter)')"
                    icon="Tag"
                    :theme="theme"
                    :border-color="currentColor"
                    @keyup.enter="addLabel"
                ></fv-text-box>
            </div>
            <div class="w-p-block" style="overflow-x: auto;">
                <fv-tag
                    v-model="labels"
                    :theme="theme"
                    :isDel="true"
                ></fv-tag>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 153, 204, 1)"
                :disabled="!value || name === '' || !ds_db"
                @click="confirm"
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

export default {
    components: {
        floatWindowBase,
    },
    props: {
        value: {
            default: null,
        },
        show: {
            default: false,
        },
    },
    data() {
        return {
            thisShow: this.show,
            name: "",
            label: "",
            labels: [],
            colorList: [
                { name: "purple", color: "#958DF1", check: false },
                { name: "red", color: "#F98181", check: false },
                { name: "orange", color: "rgba(234, 152, 101, 1)", check: false },
                { name: "yellow", color: "rgba(243, 228, 102, 1)", check: false },
                { name: "blue", color: "#70CFF8", check: false },
                { name: "teal", color: "rgba(103, 224, 192, 1)", check: false },
                { name: "green", color: "#B9F18D", check: false },
                { name: "red", color: "#ffa8a8", check: false },
                { name: "orange", color: "#ffc078", check: false },
                { name: "green", color: "#8ce99a", check: false },
                { name: "blue", color: "#74c0fc", check: false },
                { name: "purple", color: "#b197fc", check: false },
            ],
        };
    },
    watch: {
        show(val) {
            this.thisShow = val;
        },
        thisShow(val) {
            this.$emit("update:show", val);
            if (this.value.name) this.name = this.value.name;
            else this.name = "";
            if (this.value.labels) this.labels = JSON.parse(JSON.stringify(this.value.labels));
            else this.labels = [];
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.data_index,
            data_path: (state) => state.data_path,
            items: (state) => state.data_structure.items,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        currentColor() {
            for (let item of this.colorList) {
                if (item.check) return item.color;
            }
            return "rgba(25, 106, 167, 1)";
        },
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        async confirm() {
            if (!this.ds_db || !this.value || this.name === "") return;
            let _item = this.items.find((it) => it.id === this.value.id);
            _item.name = this.name;
            _item.labels = this.labels;
            this.value.name = this.name;
            this.value.labels = this.labels;
            this.reviseDS({
                $index: this.data_index,
                items: this.items,
            });
            this.thisShow = false;
        },
        addLabel() {
            if (this.label === "") return;
            this.labels.push({
                text: this.label,
                background: this.currentColor,
            });
            this.label = "";
        },
        chooseColor(index) {
            this.colorList.forEach((el, idx) => {
                if (index !== idx) {
                    el.check = false;
                    this.$set(this.colorList, idx, el);
                }
            });
        },
    },
};
</script>

<style lang="scss">
</style>