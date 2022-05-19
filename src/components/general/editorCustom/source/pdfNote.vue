<template>
    <node-view-wrapper
        class="power-editor-pdf-note-container"
        :class="[{ dark: node.attrs.theme === 'dark' }, {choosen: currentGuid === node.attrs.guid}]"
    >
        <span
            class="power-editor-pdf-note-label"
            contenteditable="false"
            :title="node.attrs.content"
            @click="tryScrollToTop(node.attrs.rangeNodes)"
        >
            <i class="label-name">PDF Note</i>
            <i
                class="ms-Icon ms-Icon--Forward"
                style="transform: scale(0.6);"
            ></i>
        </span>
        <node-view-content
            class="power-editor-pdf-note-content"
            ref="content"
        />
    </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-2";
import { mapState } from "vuex";

export default {
    name: "drawingBlock",

    components: {
        NodeViewWrapper,
        NodeViewContent,
    },

    props: {
        // the editor instance
        editor: {
            type: Object,
        },

        // the current node
        node: {
            type: Object,
        },

        // an array of decorations
        decorations: {
            type: Array,
        },

        // `true` when there is a `NodeSelection` at the current node view
        selected: {
            type: Boolean,
        },

        // access to the node extension, for example to get options
        extension: {
            type: Object,
        },

        // get the document position of the current node
        getPos: {
            type: Function,
        },

        // update attributes of the current node
        updateAttributes: {
            type: Function,
        },

        // delete the current node
        deleteNode: {
            type: Function,
        },
    },

    data() {
        return {};
    },

    computed: {
        ...mapState({
            pdfNoteInfo: (state) => state.editor.pdfNoteInfo,
        }),
        currentGuid() {
            return this.pdfNoteInfo.guid;
        },
    },
    mounted() {},
    methods: {
        tryScrollToTop(rangeNodes) {
            try {
                let idx = rangeNodes[0].index;
                let container = document.querySelectorAll(
                    ".ikfb-pdf-container"
                );
                let root = document.querySelectorAll(
                    ".pdf-display-scroll-view"
                );
                if (!container[0]) return;
                if (!root[0]) return;
                container = container[0];
                root = root[0];
                let el = root.querySelectorAll("span")[idx];
                const { top } = el.getBoundingClientRect();
                const { top: containerTop } = container.getBoundingClientRect();
                container.scrollTop = container.scrollTop + top - containerTop + 75;
            } catch (e) {
                console.log(e);
            }
        },
    },
};
</script>

<style lang="scss">
.power-editor-pdf-note-container {
    position: relative;
    background: rgba(245, 245, 245, 0.6);
    border: 3px solid rgba(200, 200, 200, 0.1);
    border-radius: 0.5rem;
    margin: 1rem 0;
    transition: all 0.3s;

    &.dark
    {
        background: rgba(28, 28, 28, 0.6);
    }

    &.choosen {
        animation: choosen-lighting 8s infinite alternate-reverse ease-in-out;
    }

    @keyframes choosen-lighting {
        from {
            border-color: rgba(200, 200, 200, 0.1);
        }
        to {
            border-color: rgba(247, 191, 100, 1);
            box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
        }
    }

    .power-editor-pdf-note-label {
        @include Vcenter;

        position: absolute;
        top: -3px;
        margin-left: 16px;
        padding: 5px 12px;
        background-color: rgba(241, 120, 107, 1);
        font-size: 0.6rem;
        letter-spacing: 1px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
        border-radius: 0 0 8px 8px;
        transition: all 0.6s;
        user-select: none;

        &:hover {
            background-color: rgba(219, 93, 79, 0.8);
        }

        &:active {
            background-color: rgba(176, 81, 71, 1);
        }

        .label-name {
            font-style: normal;
            margin-right: 3px;
        }
    }

    .power-editor-pdf-note-content {
        margin: 2.5rem 1rem 1rem;
        padding: 8px;
        border: 2px dashed rgba(200, 200, 200, 0.3);
        border-radius: 8px;
        transition: all 0.6s;

        &:hover {
            border-color: rgba(200, 200, 200, 0.6);
        }
    }
}
</style>
