<template>
    <div id="app" :class="{dark: theme == 'dark'}">
        <fv-navigation-panel class="navigation-view" :settingTitle="local('Setting')" @setting-click="Go(`/settings`)"></fv-navigation-panel>
        <div class="addition-container">
            <title-bar class="title-bar" :theme="theme" style="background: transparent;"></title-bar>
            <div class="global-container">
                <transition name="move-bottom-to-top">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import i18n from "@/js/i18n.js";
import titleBar from "@/components/general/titleBar.vue";
import Extractor from "@/js/extractTitle.js";
import { config } from '@/js/data_sample';
import { mapMutations, mapState, mapGetters } from "vuex";

export default {
    name: "App",
    components: {
        titleBar,
    },
    data () {
        return {
            extractor: Extractor
        }
    },
    computed: {
        ...mapState({
            data_path: state => state.data_path,
            language: state => state.language,
            theme: (state) => state.theme
        }),
        ...mapGetters([
            'local'
        ]),
        navigationViewBackground () {
            if(this.theme == "light")
                return "rgba(242, 242, 242, 0.8)";
            return "rgba(0, 0, 0, 0.8)"
        }
    },
    mounted() {
        this.syncDB();
        this.i18nInit();
    },
    methods: {
        ...mapMutations({
            reviseConfig: "reviseConfig",
            reviseI18N: "reviseI18N",
        }),
        i18nInit () {
            this.reviseI18N(i18n);
        },
        syncDB () {
            let _config = JSON.parse(JSON.stringify(config));
            for(let key in _config) {
                _config[key] = this.$config_db.get(key).write();
                if(!_config[key]) {
                    let object = {
                        v: this
                    };
                    object[key] = config[key];
                    this.reviseConfig(object);
                }
                else
                {
                    let object = {
                        v: this
                    };
                    object[key] = _config[key];
                    this.reviseConfig(object);
                }
            }
        },
        async gettext(pdfUrl) {
            let pdf = this.$PDFJS.getDocument(pdfUrl);
            return pdf.promise.then((pdf) => {
                // get all pages text
                let maxPages = pdf.numPages;
                let countPromises = []; // collecting all page promises
                for (let j = 1; j <= maxPages; j++) {
                    let page = pdf.getPage(j);

                    // push an promise
                    countPromises.push(
                        page.then((page) => {
                            let textContent = page.getTextContent();
                            return textContent.then((text) => {
                                return {
                                    page: j,
                                    items: text.items
                                };
                            });
                        })
                    );
                }
                // Wait for all pages and join text
                return Promise.all(countPromises).then((texts) => {
                    return texts;
                });
            });
        },
        async getPath() {
            let path_list = [];
            for (let i = 0; i < this.$refs.f.files.length; i++)
                path_list.push(this.$refs.f.files[i].path);
            console.log(path_list);
            this.$refs.i.src = path_list[0];
            let text_list = [];
            for (let i = 0; i < path_list.length; i++) {
                let file = this.$refs.f.files[i];
                let text = await this.gettext(URL.createObjectURL(file));
                text[0].items.forEach((el, idx) => {
                    text_list.push(el.str);
                    if(idx >= 100)
                        return;
                });
                console.log(text[0]);
            }
            this.$refs.t.innerHTML = text_list.join("\n");
        },
        async getTitle () {
            this.extractor.PDFJS = this.$PDFJS;
            let path_list = [];
            for (let i = 0; i < this.$refs.f.files.length; i++)
                path_list.push(this.$refs.f.files[i].path);
            console.log(path_list);
            this.$refs.i.src = path_list[0];
            for (let i = 0; i < path_list.length; i++) {
                let file = this.$refs.f.files[i];
                let title = await this.extractor.getTitle(URL.createObjectURL(file));
                console.log('⭐' + title + '⭐');
            }
        },
        async getMetaData () {
            this.extractor.PDFJS = this.$PDFJS;
            let path_list = [];
            for (let i = 0; i < this.$refs.f.files.length; i++)
                path_list.push(this.$refs.f.files[i].path);
            this.$refs.i.src = path_list[0];
            for (let i = 0; i < path_list.length; i++) {
                let file = this.$refs.f.files[i];
                let metadata = await this.extractor.getMetadata(URL.createObjectURL(file));
                console.log(metadata);
            }
        },
        async cref_getInfoByTitle(title) {
            let baseUrl = 'https://api.crossref.org/works';
            title = title.replace(/ +/g, '+');
            this.axios.get(baseUrl, {
                params: {
                    "query.bibliographic": title
                }
            }).then(response => {
                console.log(response);
            });
        },
        Go (path) {
            if(this.$route.path === path)
                return 0;
            this.$Go(path);
        }
    },
};
</script>

<style lang="scss">
#app {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    display: flex;
    overflow: hidden;
    transition: all 0.3s;

    &.dark
    {
        background: rgba(36, 36, 36, 1);
    }

    .navigation-view
    {
        height: 100%;
        z-index: 11;
    }

    .addition-container
    {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;

        .title-bar
        {
            position: absolute;
            z-index: 10;
        }

        .global-container
        {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    }

    .move-bottom-to-top-enter-active {
        animation: moveFromBottom 0.25s ease both;
    }
    .move-bottom-to-top-leave-active {
        animation: moveToTop 0.25s ease both;
    }
    @keyframes moveFromBottom {
        from {
            transform: translateY(30%);
        }
    }
    @keyframes moveToTop {
        to {
            transform: translateY(-30%);
        }
    }
}
</style>
