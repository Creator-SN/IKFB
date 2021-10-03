<template>
    <fv-navigation-panel
        :title="local('IKFB')"
        class="navigation-view"
        :theme="theme"
        :background="navigationViewBackground"
        :settingTitle="local('Setting')"
        @setting-click="Go(`/settings`)"
    >
        <template v-slot:panel>
            <div class="navigation-view-template">
                <p>{{name}}</p>
                <div class="navigation-view-tree-view-block">
                    <fv-TreeView v-model="treeList" style="width: 100%; height: 100%;">
                    </fv-TreeView>
                </div>
                <div class="navigation-view-command-bar-block">
                    <fv-command-bar
                        :options="cmdList"
                        :theme="theme"
                        toward="up"
                    ></fv-command-bar>
                </div>
            </div>
        </template>
    </fv-navigation-panel>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure, group, partition } from "@/js/data_sample";

export default {
    data() {
        return {
            cmdList: [
                {
                    name: "Add",
                    icon: "Add",
                    iconColor: "rgba(0, 90, 158, 1)",
                    secondary: [
                        {
                            name: () => this.local("New Partition"),
                            func: this.addPartition,
                            icon: "ReopenPages",
                            iconColor: "rgba(0, 153, 204, 1)",
                        },
                        { type: "divider" },
                        {
                            name: () => this.local("New Group"),
                            func: this.addGroup,
                            icon: "ViewListGroup",
                            iconColor: "rgba(0, 153, 204, 1)",
                        },
                    ],
                },
            ],
        };
    },
    watch: {
        data_index() {
            this.syncDS();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            language: (state) => state.language,
            name: (state) => state.data_structure.name,
            groups: (state) => state.data_structure.groups,
            partitions: (state) => state.data_structure.partitions,
            theme: (state) => state.theme,
        }),
        ...mapGetters(["local", "ds_db"]),
        navigationViewBackground() {
            if (this.theme == "light") return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)";
        },
        treeList() {
            let result = [];
            this.groups.forEach((el) => {
                let treeItem = this.dfsTree(el);
                result.push(treeItem);
            });
            result = result.concat(this.transPartitions(this.partitions));
            return result;
        },
    },
    mounted() {
        this.syncDS();
    },
    methods: {
        ...mapMutations({
            reviseDS: "reviseDS",
            reviseI18N: "reviseI18N",
        }),
        syncDS() {
            if (!this.ds_db) return 0;
            let _data_structure = JSON.parse(JSON.stringify(data_structure));
            for (let key in _data_structure) {
                _data_structure[key] = this.ds_db.get(key).write();
                if (!_data_structure[key]) {
                    let object = {
                        $index: this.data_index,
                    };
                    object[key] = data_structure[key];
                    this.reviseDS(object);
                } else {
                    let object = {
                        $index: this.data_index,
                    };
                    object[key] = _data_structure[key];
                    this.reviseDS(object);
                }
            }
        },
        dfsTree(groupItem) {
            let obj = JSON.parse(JSON.stringify(groupItem));
            
            obj.label = obj.name;
            obj.children = obj.groups;
            obj.editable = obj.editable == undefined ? false : obj.editable;
            obj.icon = "Folder";

            if (obj.children == undefined || obj.children.length == 0) {
                obj.children = this.transPartitions(obj.partitions);
                return obj;
            }
            for (let i = 0; i < obj.children.length; i++) {
                obj.children[i] = this.dfsTree(obj.children[i]);
            }
            obj.children = obj.children.concat(this.transPartitions(obj.partitions));
            return obj;
        },
        transPartitions(partitions) {
            let result = JSON.parse(JSON.stringify(partitions));
            result.forEach((el, idx) => {
                el.label = el.name;
                el.editable = el.editable == undefined ? false : el.editable;
                el.icon = "FileCode";
                result[idx] = el;
            });
            return result;
        },
        addGroup () {
            let _group = JSON.parse(JSON.stringify(group));
            _group.id = this.$Guid();
            _group.name = this.local('New Group Name');
            _group.emoji = '📁';
            _group.createDate = this.$SDate.DateToString(new Date());
            _group.editable = true;
            this.groups.push(_group);
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups
            });
        },
        addPartition () {
            let _partition = JSON.parse(JSON.stringify(partition));
            _partition.id = this.$Guid();
            _partition.name = this.local('New Partition Name');
            _partition.emoji = '📁';
            _partition.createDate = this.$SDate.DateToString(new Date());
            _partition.editable = true;
            this.partitions.push(_partition);
            this.reviseDS({
                $index: this.data_index,
                partitions: this.partitions
            });
        },
        Go(path) {
            if (this.$route.path === path) return 0;
            this.$Go(path);
        },
    },
};
</script>

<style lang="scss">
.navigation-view {
    height: 100%;
    z-index: 11;

    .navigation-view-template {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;

        .navigation-view-tree-view-block {
            position: relative;
            flex: 1;
        }

        .navigation-view-command-bar-block {
            position: relative;
        }
    }
}
</style>