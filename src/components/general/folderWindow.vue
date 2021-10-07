<template>
    <web-window-base
        v-if="ds_db"
        v-model="thisValue"
        :title="title"
        :theme="theme"
    >
        <template v-slot:content>
            <div class="tree-view-window">
                <fv-TreeView
                    v-model="treeList"
                    :checkable="true"
                    :theme="theme"
                    expandedIconPosition="right"
                    style="width: 100%; height: 100%;"
                >
                    <template v-slot:default="x">
                        <div class="tree-view-custom-item">
                            <p>{{x.item.emoji}}</p>
                            <p class="tree-view-custom-label">{{x.item.name}}</p>
                        </div>
                    </template>
                </fv-TreeView>
            </div>
        </template>
        <template v-slot:control>
            <fv-button
                theme="dark"
                background="rgba(0, 153, 204, 1)"
                :disabled="!ds_db || !confirmDisable"
                @click="confirm"
            >{{local('Confirm')}}</fv-button>
            <fv-button
                :theme="theme"
                @click="thisValue = false"
            >{{local('Cancel')}}</fv-button>
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
            default: false,
        },
        title: {
            default: "Folder",
        },
    },
    data() {
        return {
            thisValue: this.value,
            treeList: [],
        };
    },
    watch: {
        value(val) {
            this.thisValue = val;
        },
        thisValue(val) {
            if (val) this.refreshTreeList();
            this.$emit("input", val);
        },
    },
    computed: {
        ...mapState({
            data_index: (state) => state.data_index,
            data_path: (state) => state.data_path,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        v() {
            return this;
        },
        confirmDisable() {
            let t = [].concat(this.treeList);
            let partitions = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].type === "partition") partitions.push(t[i]);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            for (let i = 0; i < partitions.length; i++)
                if (partitions[i].selected) return true;
            return false;
        },
    },
    mounted() {
        this.refreshTreeList();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
        }),
        refreshTreeList() {
            let result = [];
            let groups = JSON.parse(JSON.stringify(this.groups));
            groups.forEach((el) => {
                let treeItem = this.dfsTree(el);
                result.push(treeItem);
            });
            result = result.concat(this.transPartitions(this.partitions));
            this.treeList = result;
        },
        dfsTree(groupItem) {
            let obj = JSON.parse(JSON.stringify(groupItem));

            obj.selected = false;
            obj.children = obj.groups;
            obj.editable = obj.editable == undefined ? false : obj.editable;
            obj.type = "group";
            obj.icon = "Folder";

            if (obj.children == undefined || obj.children.length == 0) {
                obj.children = this.transPartitions(obj.partitions);
                return obj;
            }
            for (let i = 0; i < obj.children.length; i++) {
                obj.children[i] = this.dfsTree(obj.children[i]);
            }
            obj.children = obj.children.concat(
                this.transPartitions(obj.partitions)
            );
            return obj;
        },
        transPartitions(partitions) {
            let result = JSON.parse(JSON.stringify(partitions));
            result.forEach((el, idx) => {
                el.selected = false;
                el.editable = el.editable == undefined ? false : el.editable;
                el.type = "partition";
                el.icon = "FileCode";
                result[idx] = el;
            });
            return result;
        },
        confirm() {
            let t = [].concat(this.treeList);
            let partitions = [];
            let result = [];
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].type === "partition") partitions.push(t[i]);
                if (t[i].partitions)
                    partitions = partitions.concat(t[i].partitions);
            }
            for (let i = 0; i < partitions.length; i++) {
                if (partitions[i].selected) result.push(partitions[i].id);
            }
            this.$emit("choose-partitions", result);
            this.thisValue = false;
        },
    },
};
</script>

<style lang="scss">
.tree-view-window {
    position: relative;
    flex: 1;
    width: 100%;
    height: 300px;
    max-height: 100%;
    overflow: auto;

    .tree-view-custom-item {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .tree-view-custom-label {
            margin-left: 5px;
        }

        .tree-view-custom-text-box {
            margin-left: 5px;
        }

        .tree-view-custom-confirm {
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            margin-left: 5px;
            margin-right: 25px;

            i.ms-Icon {
                margin: 0px;
                padding: 0px;
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>