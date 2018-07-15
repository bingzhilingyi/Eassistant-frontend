<style>
.formContainer{
    width:800px;
    margin: 0 auto;
}
.ivu-transfer-list{
    height:300px;
    width: 200px;
}
</style>

<template>
    <div class="formContainer">
        <Form :model="formItem"  :rules="ruleValidate" :label-width="100" ref="groupAdd">
            <FormItem>
                <Button type="primary" @click="handleSubmit('groupAdd')" :loading='isLoading'>保存并提交</Button>
                <Button type="primary" @click="returnToList" :loading='isLoading' style="margin-left: 8px">返回列表</Button>
            </FormItem>
            <FormItem label="">
                <h3>{{notice}}</h3>
            </FormItem>
            <FormItem label="权限组名称" prop="groupName">
                <Input v-model="formItem.groupName" placeholder="请输入权限组名..."></Input>
            </FormItem>
            <FormItem label="菜单权限">
                <template v-if="showTable" >
                    <Table :columns="rightsColumn" :data="rightsData" ref="rightsTable" key="table1"></Table>
                </template>
                <template v-else>
                    <Table :columns="rightsColumn" :data="rightsData" ref="rightsTable" key="table2"></Table>
                </template>
                
            </FormItem>
        </Form>
    </div>
</template>

<script>
    import servicePaths from '../router/path';
    import conf from '../data/config.js';
    export default {
        data(){
            return {
                showTable:false, //表格是否渲染，因为在数据加载完之前，不能渲染表格
                ...servicePaths(), //服务地址
                isLoading:false, //按钮是否在加载
                notice:'正在新增权限组', //提示信息
                formItem:{   //权限组数据对象
                    groupId:'',
                    groupName:'',
                    qaSysGroupRights:[] 
                },
                ruleValidate: { //验证条件
                    groupName:[
                        { required: true, message: '请输入权限组名称', trigger: 'blur' }
                    ]
                },
                rightsColumn:[
                    {
                        title: '权限',
                        key: 'rightsName'
                    },
                    {
                        title: '查询',
                        key: 'rightsSearch',
                        align: 'center',
                        render: (h, params) => {
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:params.row.rightsSearch==='Y',
                                },
                                on: {
                                    'on-change': (status) => {
                                        this.rightsData[params.index].rightsSearch = status?'Y':'N';
                                    }
                                },
                                ref: `rightsSearch`
                            },[
                                h('span',{slot:'open'},'启用'),
                                h('span',{slot:'close'},'禁用')
                            ])
                        }
                    },
                    {
                        title: '新增',
                        key: 'rightsCreate',
                        align: 'center',
                        render: (h, params) => {
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:params.row.rightsCreate==='Y'
                                },
                                on: {
                                    'on-change': (status) => {
                                        this.rightsData[params.index].rightsCreate = status?'Y':'N';
                                    }
                                }
                            },[
                                h('span',{slot:'open'},'启用'),
                                h('span',{slot:'close'},'禁用')
                            ])
                        }
                    },
                    {
                        title: '更新',
                        key: 'rightsUpdate',
                        align: 'center',
                        render: (h, params) => {
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:params.row.rightsUpdate==='Y'
                                },
                                on: {
                                    'on-change': (status) => {
                                        this.rightsData[params.index].rightsUpdate = status?'Y':'N';
                                    }
                                }
                            },[
                                h('span',{slot:'open'},'启用'),
                                h('span',{slot:'close'},'禁用')
                            ])
                        }
                    },
                    {
                        title: '删除',
                        key: 'rightsDelete',
                        align: 'center',
                        render: (h, params) => {
                            return h('i-switch',{
                                props:{
                                    size:'large',
                                    value:params.row.rightsDelete==='Y'
                                },
                                on: {
                                    'on-change': (status) => {
                                        this.rightsData[params.index].rightsDelete = status?'Y':'N';
                                    }
                                }
                            },[
                                h('span',{slot:'open'},'启用'),
                                h('span',{slot:'close'},'禁用')
                            ])
                        }
                    }
                ],
                rightsMetaData:[], //权限菜单源数据，一旦创建不允许变更
                rightsData:[] //权限菜单数据
            }
        },
        computed:{},
        props:[ 'token', 'groupId' ],
        methods:{
            //提交
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    //按钮设置为加载中
                    this.isLoading = true;
                    if (valid) {
                        //预设为save
                        var url=`${this.userServicePath}/group/save`;
                        var method='POST';
                        //如果数据源里groupid存在，改为update
                        if(this.formItem.groupId){
                            url=`${this.userServicePath}/group/update`;
                            method='PUT';
                        }

                        //设置权限
                        this.formItem.qaSysGroupRights = this.rightsData;

                        //进行保存
                        this.$axios({
                            url:url,
                            method:'post',
                            data:this.$qs.stringify({
                                group:JSON.stringify(this.formItem),
                                token:this.token,
                                _method: method
                            })
                        }).then((response)=>{
                            let data = response.data;
                            //返回success，保存成功
                            if(data.status==='success'){
                                this.$Notice.success({
                                    title: '保存成功',
                                    desc: '用户已成功保存'
                                });
                                //导航到该用户的编辑页
                                this.$router.push({name:`groupEdit`,params:{token:this.token,groupId:data.content.groupId}});
                            }else{
                                this.$Notice.error({
                                    title: '保存失败',
                                    desc: data.message
                                });
                            }
                            //按钮设置为可用
                            this.isLoading = false;
                        }).catch((e)=>{
                            this.$Notice.error({
                                title: '保存失败',
                                desc: e.responseJSON?e.responseJSON.message:''
                            });
                            //按钮设置为可用
                            this.isLoading = false;
                        })
                    } else {
                        this.$Notice.error({
                            title: '保存失败',
                            desc: '请检查数据'
                        });
                        //按钮设置为可用
                        this.isLoading = false;
                    }
               })
            },
            //彻底清除数据，包括id
            clearAll(){
                //表单数据重置
                this.formItem={
                    groupId:'',
                    groupName:'',
                    qaSysGroupRights:[] 
                };
            },
            //返回列表
            returnToList(){
                //触发切换菜单事件，把菜单切换到用户列表
                this.$emit('changeMenu','groupList');
                //直接导航到新建
                this.$router.replace({name:`groupList`,params:{token:this.token}});
            },
            //初始化方法
            init(groupId){
                var id = groupId?groupId:this.groupId;
                //如果是new，说明是新建，那么就clearall
                if(id==='new'){
                    this.clearAll(); //清空所有内容
                    this.notice = `正在新增权限组`;
                    //渲染表格
                    this.showTable = !this.showTable
                }else if(id==='hold'){
                    //如果是hold，就啥也不干
                    //渲染表格
                    this.showTable = !this.showTable
                }else{
                    this.$axios({
                        url:`${this.userServicePath}/group/findById/${id}`,
                        params:{
                            token:this.token
                        },
                        method:'get'
                    }).then((response)=>{
                        let data = response.data;
                        //返回success，登录成功
                        if(data.status==='success'){
                            this.formItem = data.content;
                            //取出权限信息
                            let rightsData = this.rightsData;
                            let qaSysGroupRights = this.formItem.qaSysGroupRights;
                            //遍历权限，如果在数据库里存在，就用数据库里的数据替代原始数据
                            for(let i=0;i<rightsData.length;i++){
                                for(let j=0;j<qaSysGroupRights.length;j++){
                                    if(rightsData[i].rightsCode===qaSysGroupRights[j].rightsCode){
                                        //取到权限名称
                                        qaSysGroupRights[j].rightsName = rightsData[i].rightsName;
                                        //替换初始数据为查出来的数据
                                        rightsData[i] = qaSysGroupRights[j];
                                    }
                                }
                            }
                            //渲染表格
                            this.showTable = !this.showTable;
                            //更改提示信息
                            this.notice = `正在编辑权限组: ${this.formItem.groupName}`;
                        }else{
                            this.$Notice.error({
                                title: '查询权限组信息失败',
                                desc: data.message
                            });
                        }
                    }).catch((err)=>{
                        this.$Notice.error({
                            title: '查询权限组信息失败'
                        });
                    })
                }
            },
            //处理对象形式的源数据，把它变为数组形式，且只留下最低级菜单
            getRightsData(menus){
                let menuData = []; //要返回的值
                //遍历源数据，把所有子菜单组成数组
                for(let i=0;i<menus.length;i++){
                    //如果有子级,就去处理子集
                    if(menus[i].child&&menus[i].child.length>0){
                        menuData = menuData.concat(this.getRightsData(menus[i].child));
                    }else{
                        //如果没子集，就把自己加入数组里
                        let obj = {};
                        obj.rightsName = menus[i].label;
                        obj.rightsCode = menus[i].key;
                        obj.rightsCreate = "N"; //创建,默认为N
                        obj.rightsUpdate = "N"; //更新,默认为N
                        obj.rightsSearch = "N"; //查询,默认为N
                        obj.rightsDelete = "N"; //删除,默认为N
                        menuData.push(obj);
                    }
                }
                return menuData;
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                //获取权限源数据
                vm.rightsMetaData = vm.getRightsData(conf.menu());
                //遍历权限源数据，复制数组里的对象到权限数据里
                vm.rightsData = [];
                for(let i=0;i<vm.rightsMetaData.length;i++){
                    vm.rightsData.push(Object.assign({}, vm.rightsMetaData[i]));
                }
                //初始化
                vm.init();
            })
        },
        beforeRouteUpdate(to, from, next){
            this.init(to.params.groupId);
        }
    }
</script>
