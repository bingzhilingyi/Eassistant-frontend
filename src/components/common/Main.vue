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
    width: 300px;
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
                        <MenuItem name="hold">
                            <Icon type="android-happy" size="20"></Icon>
                            {{loginUser.userName}}
                        </MenuItem>
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
                menuActive:this.userList,
                loginUser:{}
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
                if(e==='hold'){
                    //do nothing
                }else if(e==='userEdit'){
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
            },
            //加载当前用户拥有的菜单权限
            getLoginInfo(){
                this.$axios({
                    url:`${this.userServicePath}/Login/findByToken`,
                    method:'get',
                    params:{
                        token:this.token
                    }
                }).then((response)=>{
                    let data = response.data;
                    debugger;
                    //返回success，删除成功
                    if(data.status==='success'){
                        //筛选有权限的菜单
                        let allRights = [];
                        for(let i=0;i<data.content.rights.length;i++){
                            let nowRight = data.content.rights[i];
                            if(nowRight.rightsSearch==='Y'){
                                allRights.push(nowRight.rightsCode);
                            }
                        }
                        this.filterMenu(this.menus,allRights)
                        //取出登录人姓名及id
                        this.loginUser = data.content;
                    }else{
                        this.$Notice.error({
                            title: '查询权限失败',
                            desc: data.message
                        });
                    }
                }).catch((err)=>{
                    this.$Notice.error({title: '查询权限出现异常'});
                });
            },
            //过滤掉无权限的菜单
            filterMenu(all,target){
                if(all instanceof Array && target instanceof Array){
                    for(let i=0;i<all.length;i++){
                        //如果无子菜单，进行过滤
                        if(!all[i].child){
                            if(!target.in_array(all[i].key)){
                                all.splice(i,1);
                                i--; //因为前面去除了第i位，后面的元素自动往前移了一位，所以现在第指针要-1
                            }
                        }else if(all[i].child.length>0){  
                            //如果有子菜单且>0，过滤子菜单
                            this.filterMenu(all[i].child,target);
                            //处理完子菜单后，如果子菜单空,那自己也不用留下了
                            if(all[i].child.length===0){
                                all.splice(i,1);
                                i--;//因为前面去除了第i位，后面的元素自动往前移了一位，所以现在第指针要-1
                            }
                        }
                        
                    }
                }
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
                //查找当前登录人信息
                vm.getLoginInfo();
            })
        }
    }
</script>