<template>
    <div
        class="pdf-item"
        :key="pageIdx"
    >
        <canvas
            ref="pdfCanvas"
            @transitionend="transitionHandler"
        ></canvas>
        <div ref="textLayer"></div>
        <note-layer
            v-if="show.quickNote"
            v-show="displayMode === 1"
            :value="pdfNoteList[pageIdx]"
            :theme="theme"
            :local="local"
            :scale="thisCurrentScale + additionScaleRatio"
            :pdfNoteInfo="pdfNoteInfo"
            :reviseEditor="reviseEditor"
        ></note-layer>
    </div>
</template>

<script>
import noteLayer from "./noteLayer.vue";
import { TextLayerBuilder } from "pdfjs-dist/web/pdf_viewer";

export default {
    components: {
        noteLayer,
    },
    props: {
        value: {
            default: () => ({}),
        },
        root: {
            default: () => ({}),
        },
        parent: {
            default: () => ({}),
        },
        pageIdx: {
            required: true,
        },
        hmrVersion: {
            default: 0,
        },
        displayMode: {
            default: 1,
        },
        local: {
            default: () => {},
        },
        currentScale: {
            default: 1,
        },
        additionScaleRatio: {
            default: 0,
        },
        scrollTop: {
            default: 0,
        },
        pdfNoteInfo: {
            default: () => ({}),
        },
        pdfNoteList: {
            default: () => [],
        },
        highlightNodes: {
            default: () => [],
        },
        reviseEditor: {
            default: () => {},
        },
        show: {
            default: () => ({}),
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            width: 0,
            height: 0,
            thisValue: this.value,
            thisCurrentScale: this.currentScale,
            textContent: null,
        };
    },
    watch: {
        "value.page"(val) {
            if (val !== null) {
                this.thisValue = this.value;
                this.renderPage(5);
            }
        },
        thisValue(val) {
            this.$emit("update-page", val);
        },
        currentScale(val) {
            this.thisCurrentScale = val;
        },
        thisCurrentScale(val) {
            this.$emit("update:currentScale", val);
        },
        scrollTop() {
            this.scrollHandler();
        },
        additionScaleRatio() {
            this.scrollHandler(true);
        },
        highlightNodes: {
            deep: true,
            handler() {
                if (this.value.page !== null) this.refreshHighlight();
            },
        },
    },
    mounted() {},
    methods: {
        scrollHandler(isResize = false) {
            if (isResize) this.resizePage();
            this.transitionHandler();
        },
        transitionHandler() {
            if (!this.inVisual()) return;
            if (
                this.hmrVersion !== this.thisValue.version &&
                this.textContent !== null
            )
                this.renderText(this.textContent);
        },
        async renderPage(fixed_scale = null) {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;
            if (!pageX.lock) return;
            pageX.lock = false;

            return new Promise((resolve) => {
                let canvas = this.$refs.pdfCanvas;
                let ctx = canvas.getContext("2d");
                // 获取页面比率
                let ratio = this.getRatio(ctx);

                // 根据页面宽度和视口宽度的比率就是内容区的放大比率
                if (this.thisCurrentScale == -1) {
                    let dialogWidth = this.parent.clientWidth - 5;
                    let pageWidth = page.view[2] * ratio;
                    let scale = dialogWidth / pageWidth;
                    this.thisCurrentScale = scale;
                }

                let canvasViewport = page.getViewport({
                    scale: fixed_scale
                        ? fixed_scale
                        : this.thisCurrentScale + this.additionScaleRatio,
                });

                let viewport = page.getViewport({
                    scale: this.thisCurrentScale + this.additionScaleRatio,
                });

                // 记录内容区宽高，后期添加水印时需要
                this.width = canvasViewport.width * ratio;
                this.height = canvasViewport.height * ratio;

                // 画布渲染尺寸
                canvas.width = this.width;
                canvas.height = this.height;

                // 展示尺寸
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                page.render({
                    canvasContext: ctx,
                    viewport: canvasViewport,
                    transform: [ratio, 0, 0, ratio, 0, 0],
                })
                    .promise.then(() => {
                        return page.getTextContent();
                    })
                    .then((textContent) => {
                        this.textContent = textContent;
                        this.renderText(textContent);
                        pageX.lock = true;
                        this.thisValue = pageX;
                        resolve(1);
                    });
            });
        },
        renderText(textContent) {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;

            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio,
            });

            // 创建文本图层div
            let textLayerDiv = this.$refs.textLayer;
            textLayerDiv.setAttribute("class", "textLayer");
            textLayerDiv.innerHTML = "";

            // 创建新的TextLayerBuilder实例
            let textLayer = new TextLayerBuilder({
                textLayerDiv: textLayerDiv,
                pageIndex: this.pageIdx,
                viewport: viewport,
            });

            textLayer.setTextContent(textContent);

            textLayer.render();

            setTimeout(() => {
                this.refreshHighlight();
            }, 300);

            pageX.version = this.hmrVersion;
            // console.log(
            //     this.pageIdx,
            //     "render success",
            //     pageX.version
            // );
        },
        resizePage() {
            let pageX = this.thisValue;
            let { page } = pageX;
            if (page === null) return;
            let canvas = this.$refs.pdfCanvas;
            let viewport = page.getViewport({
                scale: this.thisCurrentScale + this.additionScaleRatio,
            });

            // 展示尺寸
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;
        },
        getRatio(ctx) {
            let dpr = window.devicePixelRatio || 1;
            let bsr =
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio ||
                1;

            return dpr / bsr;
        },
        refreshHighlight() {
            let updateGuid = (event) => {
                if (!this.show.quickNote) this.$emit("show-quick-note", true);
                this.reviseEditor({
                    pdfNoteInfo: {
                        guid: event.target.getAttribute("guid"),
                        version: this.$Guid(),
                    },
                });
            };

            let children = this.$el.querySelectorAll("span");
            children.forEach((child) => {
                child.classList.remove("highlight");
                child.removeAttribute("guid");
                child.onclick = null;
            });

            for (let node of this.highlightNodes) {
                let children = this.$refs.textLayer.querySelectorAll("span");
                for (let i = 0; i < node.rangeNodes.length; i++) {
                    if (node.rangeNodes[i].layerIndex !== this.pageIdx)
                        continue;
                    let index = node.rangeNodes[i].relativeIndex
                        ? node.rangeNodes[i].relativeIndex
                        : 0;
                    if (!children[index]) continue;
                    children[index].setAttribute("class", "highlight");
                    children[index].setAttribute("guid", node.guid);
                    children[index].onclick = updateGuid;
                }
            }
        },
        inVisual() {
            const rootBoundary = this.root.getBoundingClientRect();
            let container = {
                left: rootBoundary.left,
                top: rootBoundary.top,
                right: rootBoundary.right,
                bottom: rootBoundary.bottom,
                width: rootBoundary.right - rootBoundary.left,
                height: rootBoundary.bottom - rootBoundary.top,
            };
            const { bottom } = this.$refs.pdfCanvas.getBoundingClientRect();
            if (
                bottom - container.top >= 0 &&
                bottom - container.top <=
                    this.$refs.pdfCanvas.offsetHeight + container.height
            )
                return true;
            return false;
        },
    },
};
</script>

<style lang="scss">
.pdf-item {
    position: relative;
    width: auto;
    height: auto;
    margin-bottom: 15px;
    flex-shrink: 0;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
    overflow: visible;
    overflow-x: visible;

    canvas {
        transition: all 0.3s ease-out;
    }

    &.hide {
        .textLayer {
            span.highlight {
                background: none;

                &:hover {
                    background: none;
                    border: none;
                }

                &:active {
                    background: none;
                    border: none;
                }
            }
        }
    }

    .textLayer {
        span.highlight {
            background-color: #4158d0;
            background-image: linear-gradient(
                43deg,
                #4158d0 0%,
                #c850c0 16%,
                #ffcc70 36%
            );
            background-size: 300%;
            border-radius: 1.5px;
            background-position: 0% 50%;
            transition: background-position 0.8s;

            &:hover {
                background-position: 50% 50%;
                border-bottom: #4158d0 solid 2px;
            }

            &:active {
                background-color: #4158d0;
                background-image: linear-gradient(
                    43deg,
                    #4158d0 0%,
                    #c850c0 46%,
                    #ffcc70 100%
                );
                background-position: 150% 50%;
                border-bottom: #4158d0 solid 2px;
                transition: background-position 0.1s;
            }
        }
    }
}
</style>