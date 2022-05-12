import Vue from 'vue'
import App from './App.vue'

import router from "@/router";
import store from "@/store";

import VueFluent from "vfluentdesign";
import PowerEditor from "@creatorsn/powereditor";
import "vfluentdesign/lib/index.css";
import "@creatorsn/powereditor/lib/powereditor.css";
import 'katex/dist/katex.min.css';
import "@/style/global.scss";

import D from '@/js/dbManager.js'

import axios from 'axios'
import VueAxios from 'vue-axios'


let PDFJS = require("pdfjs-dist");
// fix pdf workerSrc
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

Vue.use(VueAxios, axios);

Vue.use(VueFluent);
Vue.use(PowerEditor);

Vue.config.productionTip = false

Vue.prototype.$config_db = D.config_db;
Vue.prototype.$load_ds_file = D.load_ds_file;

new Vue({
    router,
    store,
    render: h => h(App),
    beforeCreate () {
        Vue.prototype.$PDFJS = PDFJS;
        Vue.prototype.$Go = str => {
            this.$router.push(str);
        };
        Vue.prototype.$Back = () => {
            this.$router.back();
        };
        Vue.prototype.$Jump = str => {
            window.open(str);
        };
        Vue.prototype.$Guid = () => {
            let guid = this.$SUtility.Guid();
            guid = guid.split('-')[0];
            return guid;
        }
    }
}).$mount('#app')
