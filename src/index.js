import "babel-polyfill";
import Vue from 'vue';
import router from './router/router';
import iView from 'iview';
import mavonEditor from 'mavon-editor'
import 'iview/dist/styles/iview.css';
import './styles/index.css';
import locale from 'iview/dist/locale/zh-CN';
import 'mavon-editor/dist/css/index.css'

Vue.use(iView, { locale })
Vue.use(mavonEditor)
Vue.config.debug = true; //开启错误提示

window.loginUser = { login: false };


var app = new Vue({
    //el: '#app',
    data: {},
    components: {},
    router,
    methods: {}
}).$mount("#app")