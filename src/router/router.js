import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../components/common/Login.vue';
import Main from '../components/common/Main.vue';

Vue.use(VueRouter);

//定义路由
const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        components: {
            default: Login
        }
    },
    {
        path: '/main/:token',
        name: 'main',
        //开启了命名视图的路由，需要对每个命名视图设置props属性
        props: {
            default: true //意思是默认组件接收props
        },
        components: {
            default: Main
        },
        children: [{
            path: 'groupList',
            name: 'groupList',
            component: resolve => require(['../components/GroupList.vue'], resolve),
            props: true
        }, {
            path: 'groupEdit/:groupId',
            name: 'groupEdit',
            component: resolve => require(['../components/GroupEdit.vue'], resolve),
            props: true
        }, {
            path: 'userList',
            name: 'userList',
            component: resolve => require(['../components/UserList.vue'], resolve),
            props: true
        }, {
            path: 'userEdit/:userId',
            name: 'userEdit',
            component: resolve => require(['../components/userEdit.vue'], resolve),
            props: true
        }, {
            path: 'tree',
            component: resolve => require(['../components/Tree.vue'], resolve),
            props: true,
            children: [{
                path: '',
                name: 'tree',
                component: resolve => require(['../components/SearchNode.vue'], resolve),
                props: true
            }, {
                path: 'nodeview/:treeId',
                name: 'nodeview',
                component: resolve => require(['../components/NodeView.vue'], resolve),
                props: true
            }]
        }, {
            path: 'client',
            name: 'client',
            component: resolve => require(['../components/Client.vue'], resolve),
            props: true
        }, {
            path: 'dataVisualization',
            name: 'dataVisualization',
            component: resolve => require(['../components/DataVisualization.vue'], resolve),
            props: true
        }]
    }
];

//创建路由
const router = new VueRouter({
    routes // （缩写）相当于 routes: routes
})

//全局前置守卫
router.beforeEach((to, from, next) => {
    //判断有无登录
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!window.loginUser.login) {
            //next({ name: 'login' });
            next();
        } else {
            next();
        }
    } else {
        next();
    }
});

//全局后置守卫
router.afterEach((to, from) => {
    // ...
})

export default router