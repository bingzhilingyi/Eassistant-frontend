import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        username: '',
        password: '',
        loading: false,
    },
    getters: {
        formLogin(state) {
            return {
                username: state.username,
                password: state.password,
            }
        }
    },
    mutations: {
        updateUsername(state, value) {
            state.username = value
        },
        updatePassword(state, value) {
            state.password = value
        },
        setLoading(state, isLoading) {
            state.loading = isLoading
        },
    },
    actions: {

    },
    strict: process.env.NODE_ENV !== 'production' //严格模式影响性能，所以生产模式下不能开放
});

export default store;