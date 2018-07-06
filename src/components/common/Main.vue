<style scoped>
.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
    min-height: 600px;
}
.layout-logo{
    width: 100px;
    height: 42px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 10px;
    left: 20px;
    background-image:url("../../styles/images/logo.jpg");
    background-repeat:no-repeat; 
    background-size:100% 100%;
    -moz-background-size:100% 100%;
}
.layout-nav{
    width: 220px;
    margin: 0 auto;
    margin-right: 20px;
}
</style>
<template>
    <div class="layout">
        <Layout :style="{height: '100%'}">
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="1" @on-select="routeTo">
                    <div class="layout-logo"></div>
                    <div class="layout-nav">
                        <MenuItem name="login">
                            <Icon type="log-out"></Icon>
                            重新登录
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Layout :style="{minHeight:'500px'}">
                <Sider collapsible collapsed-width="0">
                    <Menu ref="leftMenu" :active-name="menuActive" theme="dark" width="auto" :open-names="openMenus" @on-select="routeTo">
                        <Submenu v-for="menu in menus" :name="menu.key" :key="menu.key">
                            <template slot="title">
                                <Icon :type="menu.iconType"></Icon>
                                {{menu.label}}
                            </template>
                            <MenuItem v-for="menuItem in menu.child" :name="menuItem.key" :key="menuItem.key">
                                {{menuItem.label}}
                            </MenuItem>
                        </Submenu>
                    </Menu>
                </Sider>
                <Layout :style="{padding: '0 24px'}">
                    <Content :style="{padding: '24px', background: '#fff'}">
                        <!-- keep-alive会使组件保留，不会每次都被创建 -->
                        <keep-alive>
                            <router-view @changeMenu="OnchangeMenu"></router-view>
                        </keep-alive>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    </div>
</template>
<script>
    import servicePaths from '../../router/path';
    import conf from '../../data/config.js';
    export default {
        data(){
            return {
                menus:conf.menu(), //所有菜单属性
                ...servicePaths(),
                menuActive:this.userList
            }
        },
        computed:{
            //自动展开的菜单
            openMenus(){
                let openMenus = [];
                for(let i=0;i<this.menus.length;i++){
                    openMenus.push(this.menus[i].key);
                }
                return openMenus;
            }
        },
        props:['token'], //设置组件接收的props
        methods:{
            routeTo(e){
                //如果是用户编辑，需要添加额外的param
                if(e==='userEdit'){
                    this.$router.push({name:e,params:{token:this.token,userId:'hold'}});
                }else if(e==='groupEdit'){
                    this.$router.push({name:e,params:{token:this.token,groupId:'hold'}});
                }else{
                    this.$router.push({name:e,params:{token:this.token}});
                }
                //this.$router.push({path:e});
            },
            //当子组件传来切换菜单事件时执行
            OnchangeMenu(menuName){
                this.$refs.leftMenu.currentActiveName = menuName;
            }
        },
        beforeRouteUpdate (to, from, next) {
            next();
        },
        beforeRouteEnter (to, from, next) {
            var path = to.path;
            var module = path.split("/");
            next(vm => {
                vm.OnchangeMenu(module[3]);
            })
        }
    }
</script>