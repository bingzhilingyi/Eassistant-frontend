<style>
.formContainer{
    width:600px;
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
            <FormItem label="">
                <h3>{{notice}}</h3>
            </FormItem>
            <FormItem label="权限组名称" prop="groupName">
                <Input v-model="formItem.groupName" placeholder="请输入权限组名..."></Input>
            </FormItem>
            <FormItem label="菜单权限" prop="groupName">
                <Transfer
                    :data="menuData"
                    :target-keys="targetKeys"
                    :render-format="TransferRender"
                    @on-change="handleChange"
                    :titles="transferTitle">
                </Transfer>
            </FormItem>
            <FormItem>
                <Button type="primary" @click="handleSubmit('groupAdd')" :loading='isLoading'>保存并提交</Button>
                <Button type="primary" @click="returnToList" :loading='isLoading' style="margin-left: 8px">返回列表</Button>
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
                menus:conf.menu(), //所有菜单属性
                ...servicePaths(), //服务地址
                isLoading:false, //按钮是否在加载
                formItem:{
                    groupId:'',
                    groupName:'',
                    qaSysGroupRights:[] 
                },
                notice:'正在新增权限组',
                ruleValidate: {
                    groupName:[
                        { required: true, message: '请输入权限组名称', trigger: 'blur' }
                    ]
                },
                targetKeys:[], //已被选择的菜单
                transferTitle:['未授权菜单','已授权菜单']
            }
        },
        computed:{
            //菜单集
            menuData(){
                let menuData = [];
                for(let i=0;i<this.menus.length;i++){
                    menuData = menuData.concat(this.menus[i].child);
                }
                return menuData;
            }
        },
        props:[
            'token',
            'groupId'
        ],
        methods:{
            TransferRender (item) {
                return item.label;
            },
            handleChange (newTargetKeys) {
                this.targetKeys = newTargetKeys;
            },
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
                        //把已选择权限与当前权限比对，多出的加上，少的去掉
                        let rights = this.formItem.qaSysGroupRights; //取到已有权限
                        let rightsCode = []; //已有权限code数组
                        //遍历已有权限，如果不存在于被选权限里，删除,否则把已有权限的rightsCode取出来作为数组
                        for(let i=0;i<rights.length;i++){
                            if(!this.targetKeys.in_array(rights[i].rightsCode)){
                                rights.splice(i,1);
                            }else{
                                rightsCode.push(rights[i].rightsCode);
                            }
                        }
                        //遍历被选权限，如果不存在于已有权限里，添加进已有权限里
                        for(let j=0;j<this.targetKeys.length;j++){
                            if(!rightsCode.in_array(this.targetKeys[j])){
                                rights.push({rightsCode:this.targetKeys[j]});
                            }
                        }
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
                    groupName:''
                }
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
                    this.clearAll();
                    this.notice = `正在新增权限组`;
                }else if(id==='hold'){
                    //如果是hold，就啥也不干
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
                            //把该角色拥有的权限取出来，放入已有权限里
                            let rights = this.formItem.qaSysGroupRights;
                            for(let i=0;i<rights.length;i++){
                                this.targetKeys.push(rights[i].rightsCode);
                            }
                            //更改提示信息
                            this.notice = `正在编辑权限组: ${this.formItem.groupName}`;
                        }else{
                            this.$Notice.error({
                                title: '查询用户信息失败',
                                desc: data.message
                            });
                        }
                    }).catch((err)=>{
                        this.$Notice.error({
                            title: '查询用户信息失败'
                        });
                    })
                }
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.init()
            })
        },
        beforeRouteUpdate(to, from, next){
            this.init(to.params.groupId);
        }
    }
</script>
