<template>
    <fv-navigation-panel
        :title="local('IKFB')"
        class="navigation-view"
        :expand.sync="expand"
        :theme="theme"
        :background="navigationViewBackground"
        :settingTitle="local('Setting')"
        :expandWidth="350"
        style="z-index: 2;"
        @setting-click="Go(`/settings`)"
        @back="$Back"
    >
        <template v-slot:panel>
            <div class="navigation-view-template">
                <div
                    v-show="expand"
                    class="navigation-view-current-ds-block"
                    @click="Go(`/settings`)"
                >
                    <p>⚡</p>
                    <p class="title">{{name}}</p>
                </div>
                <div
                    v-show="expand"
                    class="navigation-view-tree-view-block"
                >
                    <fv-TreeView
                        v-model="treeList"
                        :theme="theme"
                        expandedIconPosition="right"
                        background="transparent"
                        :viewStyle="{backgroundColor:'transparent'}"
                        style="width: 100%; height: 100%;"
                        @click="SwitchPartition"
                    >
                        <template v-slot:default="x">
                            <div
                                class="tree-view-custom-item"
                                @contextmenu="rightClick($event, x.item)"
                            >
                                <p>{{x.item.emoji}}</p>
                                <p
                                    v-show="!x.item.editable"
                                    class="tree-view-custom-label"
                                >{{x.item.name}}</p>
                                <fv-text-box
                                    v-model="x.item.name"
                                    v-show="x.item.editable"
                                    :ref="`t:${x.item.id}`"
                                    class="tree-view-custom-text-box"
                                    @keyup.native.enter="rename(x.item)"
                                ></fv-text-box>
                                <fv-button
                                    v-show="x.item.editable"
                                    :theme="theme"
                                    borderRadius="50"
                                    class="tree-view-custom-confirm"
                                    @click="rename(x.item)"
                                >
                                    <i class="ms-Icon ms-Icon--CheckMark"></i>
                                </fv-button>
                            </div>
                        </template>
                    </fv-TreeView>
                </div>
                <div
                    v-show="expand"
                    class="navigation-view-command-bar-block"
                >
                    <fv-command-bar
                        :options="cmdList"
                        :theme="theme"
                        toward="up"
                    ></fv-command-bar>
                </div>
                <div
                    v-show="!expand"
                    class="navigation-view-command-bar-block-collapse"
                >
                    <fv-button
                        :theme="theme"
                        class="collapse-command-btn"
                        :borderWidth="1"
                        :borderRadius="0"
                        background="rgba(245, 245, 245, 1)"
                        @click="collapseFunc(addPartition)"
                    >
                        <i
                            class="ms-Icon ms-Icon--ReopenPages"
                            style="color: rgba(213, 99, 70, 1);"
                        ></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        class="collapse-command-btn"
                        :borderWidth="1"
                        :borderRadius="0"
                        background="rgba(245, 245, 245, 1)"
                        @click="collapseFunc(addGroup)"
                    >
                        <i
                            class="ms-Icon ms-Icon--ViewListGroup"
                            style="color: rgba(172, 84, 206, 1);"
                        ></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        class="collapse-command-btn"
                        :borderWidth="1"
                        :borderRadius="0"
                        background="rgba(245, 245, 245, 1)"
                        @click="Go(`/templates`)"
                    >
                        <i
                            class="ms-Icon ms-Icon--FileTemplate"
                            style="color: rgba(0, 153, 204, 1);"
                        ></i>
                    </fv-button>
                    <fv-button
                        :theme="theme"
                        class="collapse-command-btn"
                        :borderWidth="1"
                        :borderRadius="0"
                        background="rgba(245, 245, 245, 1)"
                        @click="Go(`/`)"
                    >
                        <i
                            class="ms-Icon ms-Icon--HardDriveGroup"
                            style="color: rgba(0, 90, 158, 1);"
                        ></i>
                    </fv-button>
                </div>
            </div>
            <right-menu
                v-model="show.rightMenu"
                :theme="theme"
                :posX="posX"
                :posY="posY"
            >
                <div>
                    <span v-show="rightMenuItem.type === 'partition'">
                        <i
                            class="ms-Icon ms-Icon--Add"
                            style="color: rgba(0, 153, 204, 1);"
                        ></i>
                        <p>{{local("New Item")}}</p>
                    </span>
                    <span
                        v-show="rightMenuItem.type === 'group'"
                        @click="addPartitionAt(rightMenuItem)"
                    >
                        <i
                            class="ms-Icon ms-Icon--ReopenPages"
                            style="color: rgba(0, 153, 204, 1);"
                        ></i>
                        <p>{{local("New Partition")}}</p>
                    </span>
                    <span
                        v-show="rightMenuItem.type === 'group'"
                        @click="addGroupAt(rightMenuItem)"
                    >
                        <i
                            class="ms-Icon ms-Icon--ViewListGroup"
                            style="color: rgba(0, 153, 204, 1);"
                        ></i>
                        <p>{{local("New Group")}}</p>
                    </span>
                    <hr>
                    <span @click="rightMenuItem.editable = true">
                        <i
                            class="ms-Icon ms-Icon--Rename"
                            style="color: rgba(0, 120, 212, 1);"
                        ></i>
                        <p>{{local("Rename")}}</p>
                    </span>
                    <span @click="deleteConfirm(rightMenuItem)">
                        <i
                            class="ms-Icon ms-Icon--Delete"
                            style="color: rgba(173, 38, 45, 1);"
                        ></i>
                        <p>{{local("Delete")}}</p>
                    </span>
                </div>
            </right-menu>
        </template>
    </fv-navigation-panel>
</template>

<script>
import rightMenu from "@/components/general/rightMenu.vue";
import { mapMutations, mapState, mapGetters } from "vuex";
import { data_structure, group, partition } from "@/js/data_sample";

export default {
    components: {
        rightMenu,
    },
    data() {
        return {
            expand: true,
            cmdList: [
                {
                    name: () => this.local("Add"),
                    icon: "Add",
                    iconColor: "rgba(0, 90, 158, 1)",
                    disabled: () => this.SourceDisabled,
                    secondary: [
                        {
                            name: () => this.local("New Partition"),
                            func: this.addPartition,
                            icon: "ReopenPages",
                            disabled: () => this.SourceDisabled,
                            iconColor: "rgba(213, 99, 70, 1)",
                        },
                        { type: "divider" },
                        {
                            name: () => this.local("New Group"),
                            func: this.addGroup,
                            icon: "ViewListGroup",
                            disabled: () => this.SourceDisabled,
                            iconColor: "rgba(172, 84, 206, 1)",
                        },
                    ],
                },
                {
                    name: () => this.local("Templates"),
                    icon: "FileTemplate",
                    iconColor: "rgba(0, 153, 204, 1)",
                    func: () => this.Go("/templates"),
                    disabled: () => this.SourceDisabled,
                },
                {
                    name: () => this.local("All"),
                    icon: "HardDriveGroup",
                    iconColor: "rgba(0, 90, 158, 1)",
                    func: () => this.Go("/"),
                    disabled: () => this.SourceDisabled,
                },
            ],
            treeList: [],
            FLAT: [],
            posX: 0,
            posY: 0,
            rightMenuItem: {},
            show: {
                rightMenu: false,
            },
        };
    },
    watch: {
        data_index() {
            this.syncDS();
        },
        groups() {
            this.refreshTreeList();
        },
        partitions() {
            this.refreshTreeList();
        },
    },
    computed: {
        ...mapState({
            data_path: (state) => state.data_path,
            data_index: (state) => state.data_index,
            language: (state) => state.language,
            ds_id: (state) => state.data_structure.id,
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
        SourceDisabled() {
            if (this.ds_db === null) return true;
            if (!this.ds_id) return true;
            return false;
        },
    },
    mounted() {
        this.syncDS();
        this.refreshTreeList();
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
        refreshTreeList() {
            let result = [];
            this.saveExpandedStatus();
            this.groups.forEach((el) => {
                let treeItem = this.dfsTree(el);
                result.push(treeItem);
            });
            result = result.concat(this.transPartitions(this.partitions));
            this.treeList = result;
        },
        dfsTree(groupItem) {
            let obj = JSON.parse(JSON.stringify(groupItem));

            obj.children = obj.groups;
            obj.editable = obj.editable == undefined ? false : obj.editable;
            obj.type = "group";
            obj.icon = "Folder";

            // 从存储状态里获取expand而不是从数据库中获取 //
            let restore_status = this.FLAT.find((it) => it.id === obj.id);
            if (restore_status) obj.expanded = restore_status.expanded;

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
                el.editable = el.editable == undefined ? false : el.editable;
                el.type = "partition";
                el.icon = "FileCode";
                result[idx] = el;
            });
            return result;
        },
        saveExpandedStatus() {
            this.FLAT = [];
            let t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                this.FLAT.push(t[i]);
            }
        },
        addGroup(target = null) {
            let _group = JSON.parse(JSON.stringify(group));
            _group.id = this.$Guid();
            _group.name = this.local("New Group Name");
            _group.emoji = "📁";
            _group.createDate = this.$SDate.DateToString(new Date());
            _group.editable = true;
            if (target) target.groups.push(_group);
            else this.groups.push(_group);
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
            });
            setTimeout(() => {
                let textbox = this.$refs[`t:${_group.id}`];
                textbox.focus();
                document.execCommand("selectAll");
            }, 300);
        },
        addPartition(target = null) {
            let _partition = JSON.parse(JSON.stringify(partition));
            _partition.id = this.$Guid();
            _partition.name = this.local("New Partition Name");
            _partition.emoji = "📔";
            _partition.createDate = this.$SDate.DateToString(new Date());
            _partition.editable = true;
            if (target) target.partitions.push(_partition);
            else this.partitions.push(_partition);
            this.reviseDS({
                $index: this.data_index,
                partitions: this.partitions,
            });
            setTimeout(() => {
                let textbox = this.$refs[`t:${_partition.id}`];
                textbox.focus();
                document.execCommand("selectAll");
            }, 300);
        },
        addGroupAt(item) {
            if (item.type !== "group") return;
            let id = item.id;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].id === id) {
                    this.addGroup(t[i]);
                    break;
                }
            }
            // treeList expand //
            t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].id === id) {
                    t[i].expanded = true;
                    break;
                }
            }
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        addPartitionAt(item) {
            if (item.type !== "group") return;
            let id = item.id;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].id === id) {
                    this.addPartition(t[i]);
                    break;
                }
            }
            // treeList expand //
            t = [].concat(this.treeList);
            for (let i = 0; i < t.length; i++) {
                if (t[i].children) t = t.concat(t[i].children);
                if (t[i].id === id) {
                    t[i].expanded = true;
                    break;
                }
            }
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        rename(item) {
            let id = item.id;
            let name = item.name;
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].partitions) t = t.concat(t[i].partitions);
                if (t[i].id === id) {
                    t[i].name = name;
                    t[i].editable = false;
                    break;
                }
            }
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].id === id) {
                    this.partitions[i].name = name;
                    this.partitions[i].editable = false;
                    break;
                }
            }
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        deleteConfirm(item) {
            this.$infoBox(
                this.local(`Are you sure to delete this ${item.type}?`),
                {
                    status: "error",
                    title: this.local("Delete"),
                    confirmTitle: this.local("Confirm"),
                    cancelTitle: this.local("Cancel"),
                    theme: this.theme,
                    confirm: () => {
                        this.delete(item);
                    },
                    cancel: () => {},
                }
            );
        },
        delete(item) {
            let id = item.id;
            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].id === id) {
                    this.groups.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].id === id) {
                    this.partitions.splice(i, 1);
                    break;
                }
            }
            let t = [].concat(this.groups);
            for (let i = 0; i < t.length; i++) {
                if (t[i].groups) t = t.concat(t[i].groups);
                if (t[i].groups && t[i].groups.length > 0) {
                    let d = t[i].groups.find((it) => it.id === id);
                    let idx = t[i].groups.indexOf(d);
                    if (idx > -1) {
                        t[i].groups.splice(idx, 1);
                        break;
                    }
                }
                if (t[i].partitions && t[i].partitions.length > 0) {
                    let d = t[i].partitions.find((it) => it.id === id);
                    let idx = t[i].partitions.indexOf(d);
                    if (idx > -1) {
                        t[i].partitions.splice(idx, 1);
                        break;
                    }
                }
            }
            this.reviseDS({
                $index: this.data_index,
                groups: this.groups,
                partitions: this.partitions,
            });
            this.refreshTreeList();
        },
        rightClick(event, item) {
            event.preventDefault();
            this.show.rightMenu = true;
            let bounding = this.$el.getBoundingClientRect();
            let targetPos = {};
            targetPos.x = event.x;
            targetPos.y = event.y;
            if (targetPos.x < bounding.left) targetPos.x = bounding.left;
            if (targetPos.x + this.rightMenuWidth > bounding.right)
                targetPos.x = bounding.right - this.rightMenuWidth;
            if (targetPos.y < bounding.top) targetPos.y = bounding.top;
            if (targetPos.y + this.rightMenuHeight > bounding.bottom)
                targetPos.y = bounding.bottom - this.rightMenuHeight;
            this.posX = targetPos.x;
            this.posY = targetPos.y;

            this.rightMenuItem = item;
        },
        collapseFunc(func) {
            this.expand = true;
            func();
        },
        SwitchPartition(item) {
            if (item.type === "group") return 0;
            let id = item.id;
            if (this.$route.params.id === id) return 0;
            this.$Go(`/partitions/${id}`);
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
    position: relative;
    height: 100%;
    z-index: 5;

    .navigation-view-template {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .navigation-view-current-ds-block {
            position: relative;
            width: 100%;
            padding: 8px 15px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            user-select: none;

            &:hover {
                background: rgba(200, 200, 200, 0.3);
            }

            &:active {
                background: rgba(200, 200, 200, 0.6);
            }

            .title {
                margin-left: 15px;
                font-weight: bold;
                color: rgba(255, 180, 0, 1);
            }
        }

        .navigation-view-tree-view-block {
            position: relative;
            flex: 1;
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

        .navigation-view-command-bar-block {
            position: relative;
        }

        .navigation-view-command-bar-block-collapse {
            @include HcenterVcenterC;

            position: relative;
            width: 100%;
            height: 100%;

            .collapse-command-btn {
                width: 100%;
                flex: 1;
            }
        }
    }
}
</style>