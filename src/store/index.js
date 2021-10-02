import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        data_path: [],
        data_index: -1,
        language: 'en',
        theme: 'light',
        ds_db_list: [],
        i18n: {}
    },
    mutations: {
        reviseConfig(state, obj) {
            for (let key in obj) {
                if (key === 'v' || !state[key])
                    continue;
                state[key] = obj[key];
                obj.v.$config_db.set(key, state[key]).write();
            }
        },
        reviseDS(state, obj) {
            for (let key in obj) {
                if (key === '$index' || !state[key])
                    continue;
                state[key] = obj[key];
                state.ds_db_list[obj.$index].set(key, state[key]).write();
            }
        },
        reviseData(state, obj) {
            for (let key in obj) {
                if (!state[key])
                    continue;
                state[key] = obj[key];
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
        }
    },
    actions: {},
    getters: {
        local: state => text => {
            let result = state.i18n[text];
            if (!result)
                return text;
            return result[state.language];
        }
    },
    modules: {

    }
});