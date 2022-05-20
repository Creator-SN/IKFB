<template>
    <div>
        <div
            v-for="(note, idx) in value"
            class="pdf-note-block"
            :class="[{choosen: note.guid === pdfNoteInfo.guid,}]"
            :key="idx"
            :style="{left: note.pos.left.toFixed(2) < 0.5 ? '-320px' : 'calc(100% + 20px)', top: `${note.pos.top.toFixed(2) * 100}%`, transform: `scale(${scale < 1 ? scale - 0.1 : 1})`, 'transform-origin': `${note.pos.left.toFixed(2) < 0.5 ? 100 : 0}% 0%`}"
            @click="chooseCurrent(idx)"
        >
            <power-editor
                :value="content(idx)"
                :placeholder="local('Write something ...')"
                :editable="false"
                :theme="theme"
                :language="language"
                :editorOutSideBackground="
                    theme == 'dark' ? 'rgba(47, 52, 55, 1)' : 'white'
                "
                ref="editor"
                :style="{height: `100%`, 'font-size': `13px`}"
                style="
                    position: relative;
                    width: 100%;
                    height: 100%;
                    flex: 1;
                "
            >
            </power-editor>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            default: () => [],
        },
        local: {
            default: () => {},
        },
        scale: {
            default: 1,
        },
        language: {
            default: "en",
        },
        pdfNoteInfo: {
            default: () => {},
        },
        reviseEditor: {
            default: () => {},
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {};
    },
    computed: {
        content() {
            return (index) => {
                let content = this.value[index].content;
                let result = {
                    type: "doc",
                    content,
                };
                return result;
            };
        },
    },
    methods: {
        chooseCurrent(index) {
            this.reviseEditor({
                pdfNoteInfo: {
                    guid: this.value[index].guid,
                    version: this.$Guid(),
                },
            });
        },
    },
};
</script>

<style lang="scss">
.pdf-note-block {
    position: absolute;
    left: -300px;
    width: 300px;
    height: 300px;
    border-radius: 20px;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1), 3px 3px 8px rgba(0, 0, 0, 0.1);
    transform-origin: 100% 0%;
    transition: box-shadow 0.3s;
    opacity: 0.8;
    overflow: hidden;
    z-index: 2;

    &.choosen
    {
        box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1), 3px 3px 10px rgba(0, 0, 0, 0.2);
        opacity: 1;
        z-index: 3;
    }
}
</style>