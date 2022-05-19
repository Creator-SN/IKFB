<template>
    <div
        class="ikfb-pdf-container"
        :class="[{dark: theme === 'dark'}]"
    >
        <div
            class="pdf-display-scroll-view"
            :style="{width: scroller.width}"
            ref="scroller_view"
        >
            <div
                v-for="pageIdx in totalPages"
                class="pdf-item"
                :class="[{hide: !show.toolbar.quickNote}]"
                :ref="`pdf_item:${pageIdx}`"
                :key="pageIdx"
            >
                <canvas :ref="`pdfCanvas:${pageIdx}`"></canvas>
                <div :ref="`textLayer:${pageIdx}`"></div>
                <note-layer
                    v-if="show.toolbar.quickNote"
                    v-show="displayMode === 1"
                    :value="pdfNoteList[pageIdx]"
                    :theme="theme"
                    :local="local"
                    :scale="currentScale + additionScaleRatio"
                    :pdfNoteInfo="pdfNoteInfo"
                    :reviseEditor="reviseEditor"
                ></note-layer>
            </div>
            <fv-progress-ring
                v-if="totalPages === 0"
                loading="true"
                r="20"
                color="rgba(246, 161, 187, 1)"
                borderWidth="5"
            ></fv-progress-ring>
        </div>
        <transition name="move-top-to-bottom">
            <div
                v-show="container.width !== 0"
                class="ikfb-pdf-tool-bar"
                :style="{left: `${container.left + 60}px`, top: `${container.top + 35}px`, width: `${container.width - 120}px`}"
            >
                <div class="ikfb-pdf-tool-bar-wrapper">
                    <div class="left-block">
                        <fv-text-box
                            v-model="currentPageStr"
                            :theme="theme"
                            fontSize="12"
                            style="width: 40px; height: 100%;"
                            @keyup="toPage"
                        ></fv-text-box>
                        <p style="margin-left: 5px; font-size: 12px;">/ {{totalPages}}</p>
                    </div>
                    <div class="right-block">
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Scale Down`)"
                            style="margin-left: 2px;"
                            @click="scaleDown"
                        >
                            <i class="ms-Icon ms-Icon--Remove"></i>
                        </fv-button>
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Scale Up`)"
                            style="margin-left: 2px;"
                            @click="scaleUp"
                        >
                            <i class="ms-Icon ms-Icon--Add"></i>
                        </fv-button>
                        <fv-button
                            :theme="theme"
                            class="control-btn"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Open with Browser`)"
                            style="margin-left: 2px;"
                            @click="$emit('open-with-browser')"
                        >
                            <i class="ms-Icon ms-Icon--Globe"></i>
                        </fv-button>
                        <fv-button
                            :theme="show.toolbar.quickNote ? 'dark' : theme"
                            class="control-btn"
                            :background="show.toolbar.quickNote ? 'rgba(247, 191, 100, 1)' : theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Toggle QuickNote`)"
                            style="margin-left: 2px;"
                            @click="show.toolbar.quickNote ^= true"
                        >
                            <i class="ms-Icon ms-Icon--QuickNote"></i>
                        </fv-button>
                        <fv-button
                            :theme="show.toolbar.translate ? 'dark' : theme"
                            class="control-btn"
                            :background="show.toolbar.translate ? 'rgba(0, 98, 158, 1)' : theme === 'dark' ? 'rgba(36, 36, 36, 1)': 'rgba(247, 247, 247, 1)'"
                            :title="local(`Toggle Translator`)"
                            style="margin-left: 2px;"
                            @click="show.toolbar.translate ^= true"
                        >
                            <i class="ms-Icon ms-Icon--LocaleLanguage"></i>
                        </fv-button>
                    </div>
                </div>
                <transition :name="show.translate ? 'move-right-to-left' : 'move-left-to-right'">
                    <div
                        v-show="show.translate"
                        class="ikfb-pdf-translation-panel"
                    >
                        <div class="control-banner">
                            <fv-button
                                :theme="theme"
                                :borderRadius="30"
                                class="control-btn"
                                :is-box-shadow="true"
                                @click="show.translate = false"
                            >
                                <i class="ms-Icon ms-Icon--Cancel"></i>
                            </fv-button>
                        </div>
                        <fv-text-field
                            v-model="translateObj.selection"
                            :theme="theme"
                            :placeholder="local(`Edit Text Here and Re-Translate by Press (Ctrl + Enter)`)"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 1)' : 'rgba(255, 255, 255, 1)'"
                            class="text-field"
                            fontSize="13"
                            :border-radius="6"
                            @keyup="ctrlEnterTranslate"
                        ></fv-text-field>
                        <fv-text-field
                            v-show="translateObj.selection !== '' && translateObj.text !== ''"
                            v-model="translateObj.text"
                            :theme="theme"
                            class="text-field"
                            :background="theme === 'dark' ? 'rgba(36, 36, 36, 0.6)' : 'rgba(255, 255, 255, 0.3)'"
                            fontSize="13"
                            readonly
                            :border-radius="6"
                        ></fv-text-field>
                        <fv-shimmer
                            v-if="translateObj.selection !== '' && translateObj.text === ''"
                            :theme="theme"
                            style="position: relative; width: 100%; height: 100%; flex: 1;"
                        >
                            <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                                <div
                                    v-for="(item, index) in 2"
                                    :key="index"
                                    style="margin-top: 5px; display: flex; align-items: center;"
                                >
                                    <div
                                        class="sample"
                                        style="width: 80%; margin: 5px;"
                                    ></div>
                                    <div
                                        class="sample"
                                        style="width: 80%; flex: 1; margin: 5px;"
                                    ></div>
                                </div>
                                <div
                                    v-for="(item, index) in 2"
                                    :key="`s2: ${index}`"
                                    style="margin-top: 5px; display: flex; align-items: center;"
                                >
                                    <div
                                        class="sample"
                                        style="width: 80%; height: 15px; margin: 5px;"
                                        :style="{width: `${100 - index * 10}%`}"
                                    ></div>
                                </div>
                            </div>
                        </fv-shimmer>
                    </div>
                </transition>
            </div>
        </transition>
        <add-ring-button
            v-model="show.addNote"
            :parent="$el"
            :selectionObj="selectionObj"
            @choose-selection="$emit('choose-selection', $event)"
        ></add-ring-button>
    </div>
</template>

<script>
import gsap from "gsap";

import { mapGetters, mapMutations, mapState } from "vuex";
import { TextLayerBuilder } from "pdfjs-dist/web/pdf_viewer";

import addRingButton from "./addRingButton.vue";
import noteLayer from "./noteLayer.vue";

import "pdfjs-dist/web/pdf_viewer.css";

const { ipcRenderer: ipc } = require("electron");

export default {
    components: {
        addRingButton,
        noteLayer,
    },
    props: {
        url: {
            default:
                "C:/Users/Alever/OneDrive/Documents/Papers/IKFB/root/items/c8732a00/c8732a00.pdf",
        },
        theme: {
            default: "light",
        },
    },
    data() {
        return {
            currentPage: 1,
            currentPageStr: "1",
            totalPages: 0,
            visualPages: [],
            currentScale: -1,
            additionScaleRatio: 0,
            width: 0,
            height: 0,
            pdfDoc: null,
            pdfPages: [],
            hmrVersion: 0,
            container: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 0,
                height: 0,
            },
            scroller: {
                width: `100%`,
            },
            translateObj: {
                selection: "",
                text: "",
                pronunciation: "",
            },
            selectionObj: {
                pos: {
                    left: 0,
                    top: 0,
                    canvasIndex: 0,
                },
                rangeNodes: [],
                content: "",
            },
            show: {
                translate: false,
                editable: false,
                addNote: false,
                toolbar: {
                    translate: true,
                    quickNote: false,
                },
            },
            timer: {
                width: null,
                translate: null,
            },
            lock: {
                init: true,
                page: [],
            },
        };
    },
    watch: {
        url() {
            this.$nextTick(() => {
                this.totalPages = 0;
                this.currentPage - 1;
                this.currentPageStr - "1";
                this.hmrVersion = 0;
                this.pdfPages = [];
                this.initPDF();
            });
        },
        additionScaleRatio() {
            this.hmrVersion += 1;
            if (this.currentPage > 1) this.renderPage(this.currentPage - 1);
            this.renderPage(this.currentPage);
            if (this.currentPage < this.totalPages)
                this.renderPage(this.currentPage + 1);
            this.$nextTick(() => {
                this.visualCanvas();
                this.loadingPages(true);
            });
            this.loadingPages(true);
        },
        currentPage() {
            if (this.currentPage > 1) this.renderPage(this.currentPage - 1);
            this.renderPage(this.currentPage);
            if (this.currentPage < this.totalPages)
                this.renderPage(this.currentPage + 1);
            this.$nextTick(() => {
                this.visualCanvas();
                this.visualPages.forEach((page) => {
                    this.renderPage(page);
                });
            });
            this.currentPageStr = this.currentPage.toString();
        },
        "translateObj.selection"() {
            this.toTranslate(800);
        },
        highlightNodes: {
            deep: true,
            handler() {
                this.refreshHighlight();
            },
        },
        displayMode() {
            if (this.displayMode !== 0) {
                let width = this.$el.clientWidth;
                let scrollerWidth = this.$refs.scroller_view.clientWidth;
                this.$el.scrollLeft = (scrollerWidth - width) / 2;
            }
        },
    },
    computed: {
        ...mapState({
            targetContent: (state) => state.editor.targetContent,
            pdfNoteInfo: (state) => state.editor.pdfNoteInfo,
            displayMode: (state) => state.editor.displayMode,
        }),
        ...mapGetters(["local"]),
        highlightNodes() {
            let content = this.targetContent.content;
            let result = [];
            for (let i = 0; i < content.length; i++) {
                let node = content[i];
                if (node.content) content = content.concat(node.content);
                try {
                    if (node.type === "pdfNote") {
                        result.push({
                            guid: node.attrs.guid,
                            pos: node.attrs.pos,
                            rangeNodes: node.attrs.rangeNodes,
                            content: node.attrs.content,
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            return result;
        },
        pdfNoteList() {
            let content = this.targetContent.content;
            let arr = [];
            let result = [];
            for (let i = 0; i < content.length; i++) {
                let node = content[i];
                if (node.content) content = content.concat(node.content);
                try {
                    if (node.type === "pdfNote") {
                        arr.push({
                            guid: node.attrs.guid,
                            type: node.type,
                            content: node.content,
                            idx: node.attrs.pos.canvasIndex,
                            pos: node.attrs.pos,
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            for (let item of arr) {
                if (!result[item.idx]) {
                    result[item.idx] = [];
                }
                result[item.idx].push(item);
            }
            return result;
        },
    },
    mounted() {
        this.timerInit();
        setTimeout(() => {
            this.initPDF();
        }, 300);
        this.eventInit();
    },
    methods: {
        ...mapMutations({
            reviseEditor: "reviseEditor",
        }),
        timerInit() {
            this.timer.width = setInterval(() => {
                const { left, top, right, bottom } =
                    this.$el.getBoundingClientRect();
                this.container.left = left;
                this.container.top = top;
                this.container.right = right;
                this.container.bottom = bottom;
                this.container.width = right - left;
                this.container.height = bottom - top;
            }, 50);
        },
        eventInit() {
            this.$el.addEventListener("scroll", this.refreshCurrentPage);
            let getTextEvent = () => {
                let result = this.getRangeNodes(this.$refs.scroller_view);
                let text = "";
                if (result.length === 1) {
                    text = result[0].node.innerText.slice(
                        result[0].offset,
                        result[0].endOffset
                    );
                } else {
                    result.forEach((el) => {
                        text += `${el.node.innerText.slice(
                            el.offset,
                            el.endOffset
                        )} `;
                    });
                }
                text = text.replace(/ +/g, " ");
                return {
                    text,
                    rangeNodes: result,
                };
            };
            let insideTextLayer = (event) => {
                let x = event.target;
                let _self = false;
                while (x && x.tagName && x.tagName.toLowerCase() != "body") {
                    if ([...x.classList].includes("textLayer")) {
                        _self = true;
                        break;
                    }
                    x = x.parentNode;
                }
                return _self;
            };
            let translateEvent = (event) => {
                if (!this.show.toolbar.translate) return;
                if (!insideTextLayer(event)) return;
                let text = getTextEvent().text;
                this.translateObj.selection = text;
                if (this.translateObj.selection !== "")
                    this.show.translate = true;
                this.toTranslate();
            };
            let addPDFNoteEvent = (event) => {
                if (!insideTextLayer(event)) return;
                let { text, rangeNodes } = getTextEvent();
                if (text.replace(/ +/g, "") === "") {
                    this.show.addNote = false;
                    return;
                }
                this.selectionObj.content = text;
                this.selectionObj.rangeNodes = rangeNodes;
                let node = rangeNodes[0].node;
                let targetNode = {
                    index: 0,
                    node: null,
                };
                for (let i = 1; i <= this.totalPages; i++) {
                    let pdf_item = this.$refs[`pdf_item:${i}`][0];
                    let index = [].indexOf.call(
                        pdf_item.querySelectorAll("span"),
                        node
                    );
                    if (index > -1) {
                        targetNode.index = i;
                        targetNode.node = pdf_item;
                        break;
                    }
                }
                this.selectionObj.pos.left =
                    parseFloat(
                        getComputedStyle(node).getPropertyValue("left")
                    ) / targetNode.node.offsetWidth;
                this.selectionObj.pos.top =
                    parseFloat(getComputedStyle(node).getPropertyValue("top")) /
                    targetNode.node.offsetHeight;
                this.selectionObj.pos.canvasIndex = targetNode.index;
                this.show.addNote = true;
            };
            this.$refs.scroller_view.addEventListener("click", translateEvent);
            this.$refs.scroller_view.addEventListener("click", addPDFNoteEvent);
            ipc.on("translate-callback", (event, res) => {
                this.translateObj.text = res.text;
                this.translateObj.pronunciation = res.pronunciation;
            });
        },
        async initPDF() {
            if (!this.lock.init) return;
            this.lock.init = false;
            let guid = this.$Guid();
            ipc.send("read-binary", {
                id: guid,
                path: this.url,
            });
            let url = await new Promise((resolve) => {
                ipc.on(`read-binary-${guid}`, (event, arg) => {
                    let blob = new Blob([arg], { type: "application/pdf" });
                    let url = URL.createObjectURL(blob);
                    resolve(url);
                });
            });
            this.$PDFJS.getDocument(url).promise.then((pdf) => {
                // 文档对象
                this.pdfDoc = pdf;
                // 总页数
                this.totalPages = pdf.numPages;
                this.lock.init = true;
                // 渲染页面
                for (let i = 1; i <= this.totalPages; i++) {
                    this.pdfDoc.getPage(i).then((page) => {
                        this.pdfPages.push({
                            num: i,
                            page,
                            lock: true,
                            version: -1,
                        });
                        this.renderPage(i);
                    });
                }
            });
        },
        loadingPages(performance = false) {
            let promises = [];
            this.$nextTick(() => {
                for (let i = 1; i <= this.totalPages; i++) {
                    if (!performance) promises.push(this.renderPage(i));
                    else {
                        promises.push(
                            this.renderPage(i, !this.visualPages.includes(i))
                        );
                    }
                }
            });
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
        async renderPage(num, performance = false) {
            let pageX = this.pdfPages.find((page) => page.num === num);
            let { page } = pageX;
            if (!pageX.lock) return;
            pageX.lock = false;

            return new Promise((resolve) => {
                let canvas = this.$refs[`pdfCanvas:${num}`][0];
                let ctx = canvas.getContext("2d");
                // 获取页面比率
                let ratio = this.getRatio(ctx);

                // 根据页面宽度和视口宽度的比率就是内容区的放大比率
                if (this.currentScale == -1) {
                    let dialogWidth = this.$el.clientWidth - 5;
                    let pageWidth = page.view[2] * ratio;
                    let scale = dialogWidth / pageWidth;
                    this.currentScale = scale;
                }

                let viewport = page.getViewport({
                    scale: this.currentScale + this.additionScaleRatio,
                });

                // 记录内容区宽高，后期添加水印时需要
                this.width = viewport.width * ratio;
                this.height = viewport.height * ratio;

                // 当前版本和热重载版本一致时，仅更新Canvas布局尺寸
                if (pageX.version === this.hmrVersion) {
                    // 展示尺寸
                    canvas.style.width = `${viewport.width}px`;
                    canvas.style.height = `${viewport.height}px`;
                    pageX.lock = true;
                    resolve(0);
                    return;
                }

                // 画布渲染尺寸
                canvas.width = this.width;
                canvas.height = this.height;

                // 展示尺寸
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                //
                this.scroller.width = `${
                    viewport.width + (this.displayMode === 1 ? 1000 : 50)
                }px`;

                if (!performance) {
                    page.render({
                        canvasContext: ctx,
                        viewport,
                        transform: [ratio, 0, 0, ratio, 0, 0],
                    })
                        .promise.then(() => {
                            return page.getTextContent();
                        })
                        .then((textContent) => {
                            // 创建文本图层div
                            let textLayerDiv =
                                this.$refs[`textLayer:${num}`][0];
                            textLayerDiv.setAttribute("class", "textLayer");
                            textLayerDiv.innerHTML = "";

                            // 创建新的TextLayerBuilder实例
                            var textLayer = new TextLayerBuilder({
                                textLayerDiv: textLayerDiv,
                                pageIndex: page.pageIndex,
                                viewport: viewport,
                            });

                            textLayer.setTextContent(textContent);

                            textLayer.render();

                            this.refreshHighlight();

                            pageX.version = this.hmrVersion;
                            // console.log(
                            //     pageX.num,
                            //     "render success",
                            //     pageX.version
                            // );
                            pageX.lock = true;
                            resolve(1);
                        });
                } else {
                    pageX.lock = true;
                    resolve(0);
                }
            });
        },
        refreshCurrentPage() {
            if (!this.pdfDoc) return;
            let arr = [];
            for (let i = 1; i <= this.totalPages; i++) {
                const { bottom } =
                    this.$refs[`pdfCanvas:${i}`][0].getBoundingClientRect();
                arr.push({
                    i,
                    value: Math.abs(bottom - this.container.height),
                });
            }
            arr.sort((a, b) => {
                return a.value - b.value;
            });
            this.currentPage = arr[0].i;
            this.visualCanvas();
        },
        visualCanvas() {
            if (!this.pdfDoc) return;
            let visualPages = [];
            for (let i = 1; i <= this.totalPages; i++) {
                const { top, bottom } =
                    this.$refs[`pdfCanvas:${i}`][0].getBoundingClientRect();
                if (
                    (top >= 0 && top <= this.container.height) ||
                    (bottom >= 0 && bottom <= this.container.height)
                ) {
                    visualPages.push(i);
                }
            }
            this.visualPages = visualPages;
        },
        scaleUp() {
            if (this.currentScale + this.additionScaleRatio < 5.7) {
                this.additionScaleRatio += 0.3;
            }
        },
        scaleDown() {
            if (this.currentScale + this.additionScaleRatio > 0.6) {
                this.additionScaleRatio -= 0.3;
            }
        },
        getRangeNodes(rootNode = null) {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let root = rootNode ? rootNode : range.commonAncestorContainer;
            if (root.nodeType === Node.TEXT_NODE) {
                root = root.parentNode;
                return [
                    {
                        node: root,
                        offset: range.startOffset,
                        endOffset: range.endOffset,
                        index: null,
                    },
                ];
            }
            let start = {
                node: range.startContainer,
                offset: range.startOffset,
                endOffset: Infinity,
            };
            let end = {
                node: range.endContainer,
                offset: null,
                endOffset: range.endOffset,
            };
            if (start.node.nodeType === Node.TEXT_NODE)
                start.node = start.node.parentNode;
            if (end.node.nodeType === Node.TEXT_NODE)
                end.node = end.node.parentNode;
            let children = root.querySelectorAll("span");
            start.index = Array.prototype.indexOf.call(children, start.node);
            end.index = Array.prototype.indexOf.call(children, end.node);
            if (
                range.collapsed === true ||
                range.startContainer === range.endContainer
            ) {
                return [
                    {
                        node: start.node,
                        offset: range.startOffset,
                        endOffset: range.endOffset,
                        index: start.index,
                    },
                ];
            }
            let result = [];
            result.push(start);
            for (let i = start.index + 1; i < end.index; i++) {
                result.push({
                    node: children[i],
                    offset: null,
                    endOffset: Infinity,
                    index: i,
                });
            }
            result.push(end);
            return result;
        },
        toTranslate(period = 500) {
            clearTimeout(this.timer.translate);
            this.timer.translate = setTimeout(() => {
                if (this.translateObj.selection !== "") {
                    ipc.send("translate", {
                        text: this.translateObj.selection,
                        from: "en",
                        to: "zh-CN",
                    });
                }
            }, period);
        },
        ctrlEnterTranslate(event) {
            if (!(event.keyCode === 13 && event.ctrlKey)) return;
            this.toTranslate();
        },
        refreshHighlight() {
            let root = this.$refs.scroller_view;
            let children = root.querySelectorAll("span");
            let updateGuid = (event) => {
                this.reviseEditor({
                    pdfNoteInfo: {
                        guid: event.target.getAttribute("guid"),
                        version: this.$Guid(),
                    },
                });
            };
            children.forEach((child) => {
                child.classList.remove("highlight");
                child.removeAttribute("guid");
                child.onclick = null;
            });
            for (let node of this.highlightNodes) {
                for (let i = 0; i < node.rangeNodes.length; i++) {
                    let index = node.rangeNodes[i].index;
                    if (!children[index]) continue;
                    children[index].setAttribute("class", "highlight");
                    children[index].setAttribute("guid", node.guid);
                    children[index].onclick = updateGuid;
                }
            }
        },
        toPage(event, offset = 0) {
            if (event.keyCode !== 13) return;
            if (this.currentPageStr <= 0) {
                this.currentPageStr = 1;
            }
            if (this.currentPageStr > this.totalPages) {
                this.currentPageStr = this.totalPages;
            }
            let height = 0;
            for (let i = 2; i <= this.currentPageStr; i++) {
                let pdfItem = this.$refs[`pdf_item:${i - 1}`][0];
                height +=
                    pdfItem.offsetHeight +
                    parseFloat(
                        getComputedStyle(pdfItem).getPropertyValue(
                            "margin-bottom"
                        )
                    );
            }
            gsap.to(this.$el, {
                scrollTop: height + offset,
                duration: 0.2,
                ease: "power3.out",
            });
        },
    },
    beforeDestroy() {
        for (let key in this.timer) {
            clearInterval(this.timer[key]);
        }
    },
};
</script>

<style lang="scss">
.ikfb-pdf-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    &.dark {
        .pdf-display-scroll-view {
            .pdf-item {
                canvas {
                    // filter: invert(100%);
                }
            }
        }

        .ikfb-pdf-tool-bar {
            .ikfb-pdf-tool-bar-wrapper {
                background: rgba(50, 50, 50, 0.8);
                color: whitesmoke;
            }

            .ikfb-pdf-translation-panel {
                background: rgba(50, 50, 50, 0.8);
            }
        }
    }

    .pdf-display-scroll-view {
        position: relative;
        min-width: 100%;
        width: auto;
        height: auto;
        flex-shrink: 0;
        padding-top: 80px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        float: left;
        overflow: hidden;

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
                    }
                }
            }
        }
    }

    .ikfb-pdf-tool-bar {
        position: fixed;
        left: 15px;
        top: 50px;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        transition: all 0.3s;
        z-index: 3;

        .ikfb-pdf-tool-bar-wrapper {
            @include Vcenter;

            position: relative;
            width: 100%;
            height: 100%;
            padding: 5px 15px;
            background: rgba(247, 247, 247, 0.8);
            border: rgba(120, 120, 120, 0.1) solid thin;
            border-radius: 12px;
            box-sizing: border-box;
            box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1),
                0px 3px 6px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);

            .left-block {
                @include Vcenter;

                position: relative;
                width: 100%;
                height: 100%;
                flex: 1;
            }

            .right-block {
                @include HendVcenter;

                position: relative;
                width: 100%;
                height: 100%;
                flex: 1;
            }

            .control-btn {
                width: 30px;
                height: 100%;
            }
        }

        .ikfb-pdf-translation-panel {
            @include VcenterC;

            position: absolute;
            right: 0px;
            top: 50px;
            width: 350px;
            height: 500px;
            padding: 5px 12px;
            background: rgba(239, 239, 239, 0.6);
            border: rgba(120, 120, 120, 0.1) solid thin;
            border-radius: 6px;
            box-sizing: border-box;
            box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1),
                0px 3px 8px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            z-index: 3;

            .control-banner {
                @include HendVcenter;

                position: relative;
                width: 100%;
                height: 50px;

                .control-btn {
                    width: 30px;
                    height: 30px;
                    margin: 5px;
                }
            }

            .text-field {
                width: 100%;
                height: 100%;
                margin: 5px 0px;
                flex: 1;
                transition: all 0.3s;

                textarea {
                    padding: 8px;
                    line-height: 2;
                }
            }
        }
    }
}
</style>