import "babel-polyfill";
import Vue from 'vue';
import router from './router/router';
import iView from 'iview';
import mavonEditor from 'mavon-editor'
import 'iview/dist/styles/iview.css';
import './styles/index.css';
import locale from 'iview/dist/locale/zh-CN';
import 'mavon-editor/dist/css/index.css';
import axios from 'axios';
import qs from 'qs';
import $ from 'jquery';
//为array添加工具方法
Array.prototype.in_array = function(element) {　　
    for (var i = 0; i < this.length; i++) {　　
        if (this[i] == element) {　　
            return true;
        }
    }
    return false;
}

Vue.use(iView, { locale })
Vue.use(mavonEditor)
Vue.config.debug = true; //开启错误提示
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
Vue.prototype.$$ = $;

window.loginUser = { login: false };


var app = new Vue({
    //el: '#app',
    data: {},
    components: {},
    router,
    methods: {}
}).$mount("#app")