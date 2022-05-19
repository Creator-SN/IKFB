import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import pdfNote from '../source/pdfNote.vue';

export default Node.create({
    name: 'pdfNote',

    group: 'block',

    content: "block+",

    addAttributes() {
        return {
            value: {
                default: ''
            },
            guid: {
                default: ''
            },
            pos: {
                default: {
                    left: 0,
                    top: 0,
                    canvasIndex: 0
                }
            },
            rangeNodes: {
                default: []
            },
            content: {
                default: ""
            },
            theme: {
                default: 'light',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'pdf-note',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['pdf-note', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return VueNodeViewRenderer(pdfNote);
    },
});
