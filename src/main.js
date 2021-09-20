import Vue from 'vue'
import App from './App.vue'

import router from "@/router";
import store from "@/store";

import VueFluent from "vfluentdesign";
import "vfluentdesign/lib/index.css";
import "@/style/global.scss";

let PDFJS = require("pdfjs-dist");

Vue.use(VueFluent);

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
    beforeCreate () {
        Vue.prototype.$PDFJS = PDFJS;
    }
}).$mount('#app')
