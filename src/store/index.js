import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        // config //
        init_status: true,
        data_path: [],
        data_index: -1,
        language: 'en',
        theme: 'light',
        // ds //
        data_structure: {
            id: null,
            name: null,
            groups: [],
            partitions: [],
            items: [],
            templates: [],
            path: null,
            createDate: null,
        },
        //
        editor: {
            show: false,
            type: null,
            item: null,
            target: null,
            scrollTop: 0,
            history: []
        },
        pdfImporter: {
            value: false,
            item: null,
            mode: "item",
            pdf_importer: null,
            df: [],
            c: 0
        },
        ds_db_list: [],
        i18n: {}
    },
    mutations: {
        reviseConfig(state, obj) {
            for (let key in obj) {
                if (key === 'v' || state[key] === undefined)
                    continue;
                state[key] = obj[key];
                obj.v.$config_db.set(key, state[key]).write();
            }
        },
        reviseDS(state, obj) {
            for (let key in obj) {
                if (key === '$index' || state.data_structure[key] === undefined)
                    continue;
                state.data_structure[key] = obj[key];
                state.ds_db_list[obj.$index].set(key, state.data_structure[key]).write();
            }
        },
        reviseData(state, obj) {
            for (let key in obj) {
                if (state[key] === undefined)
                    continue;
                state[key] = obj[key];
            }
        },
        reviseEditor(state, obj) {
            for (let key in obj) {
                if (state.editor[key] === undefined)
                    continue;
                state.editor[key] = obj[key];
            }
        },
        revisePdfImporter(state, obj) {
            for (let key in obj) {
                if (state.pdfImporter[key] === undefined)
                    continue;
                state.pdfImporter[key] = obj[key];
            }
        },
        reviseI18N(state, i18n) {
            state.i18n = i18n
        },
        toggleTheme(state, v) {
            if (state.theme == 'light') {
                state.theme = 'dark'
            } else {
                state.theme = 'light'
            }
            v.$config_db.set('theme', state.theme).write();
        },
        toggleEditor(state, status) {
            state.editor.show = status;
        }
    },
    actions: {},
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if (!result)
                return text;
            return result[state.language];
        },
        ds_db: state => {
            if (state.data_index < 0)
                return null;
            if (!state.ds_db_list[state.data_index])
                return null;
            return state.ds_db_list[state.data_index];
        }
    },
    modules: {

    }
});