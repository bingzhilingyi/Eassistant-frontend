<style scoped>
.formContainer{
    width:600px;
    margin: 0 auto;
}
</style>

<template>
    <div class="formContainer">
        <Form :model="formItem"  :rules="ruleValidate" :label-width="80" ref="UserAdd">
            <FormItem>
                <Button type="primary" @click="handleSubmit('UserAdd')" :loading='isLoading'>保存并提交</Button>
                <Button type="ghost" @click="handleReset('UserAdd')" style="margin-left: 8px" :loading='isLoading'>重置</Button>
                <Button type="primary" @click="returnToList" :loading='isLoading' style="margin-left: 8px">返回列表</Button>
            </FormItem>
            <FormItem label="">
                <h3>{{notice}}</h3>
            </FormItem>
            <FormItem label="账号" prop="userAccount">
                <Input v-model="formItem.userAccount" placeholder="请输入账号..."></Input>
            </FormItem>
            <FormItem label="密码" prop="userPassword">
                <Input v-model="formItem.userPassword" placeholder="请输入密码..." type="password"></Input>
            </FormItem>
            <FormItem label="确认密码" prop="confirmPassword">
                <Input v-model="formItem.confirmPassword" placeholder="请确认密码..." type="password"></Input>
            </FormItem>
            <FormItem label="姓名" prop="userName">
                <Input v-model="formItem.userName" placeholder="请确认姓名..."></Input>
            </FormItem>
            <FormItem label="邮箱" prop="userEmail">
                <AutoComplete v-model="formItem.userEmail" :data="emailData" @on-search="handleEmailInput" placeholder="请输入邮箱..."></AutoComplete>        
            </FormItem>
            <FormItem label="手机" prop="userPhone">
                <Input v-model="formItem.userPhone" placeholder="请输入手机号..."></Input>
            </FormItem>
            <FormItem label="角色">
                <Transfer
                    :data="groupData"
                    :target-keys="targetKeys"
                    :render-format="TransferRender"
                    @on-change="handleChange"
                    :titles="transferTitle">
                </Transfer>
            </FormItem>
            
        </Form>
    </div>
</template>

<script>
    import servicePaths from '../router/path';
    import email from '../util/email'; //邮箱自动提示的方法
    export default {
        data(){
            const validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else if(value.length<6){
                    callback(new Error('密码长度不能小于6位！'));
                }else{
                    if (this.formItem.confirmPassword !== '') {
                        // 对第二个密码框单独验证
                        this.$refs.UserAdd.validateField('confirmPassword');
                    }
                    callback();
                }
            };
            const validatePassCheck = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.formItem.userPassword) {
                    callback(new Error('两次输入的密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                ...servicePaths(), //服务地址
                ...email.data(), //邮箱自动补全数据源
                isLoading:false, //按钮是否在加载
                formItem:{
                    userId:'',
                    userAccount:'',
                    userPassword:'',
                    confirmPassword:'',
                    userName:'',
                    userEmail:'',
                    userPhone:'',
                    userLdap:'',
                    qaSysUserGroup:[]
                },
                notice:'正在新增用户',
                ruleValidate: {
                    userAccount:[
                        { required: true, message: '请输入账号', trigger: 'blur' }
                    ],
                    userPassword:[
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { validator: validatePass, trigger: 'blur' }
                    ],
                    confirmPassword:[
                        { required: true, message: '请再次输入密码', trigger: 'blur' },
                        { validator: validatePassCheck, trigger: 'blur' }
                    ],
                    userName:[
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    userEmail:[
                        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                    ],
                    userPhone:[
                        // { type: 'number', message: '请输入数字！', trigger: 'blur' }
                    ],
                },
                groupData:[],
                targetKeys:[], //已被选择的菜单
                transferTitle:['可选角色','已有角色']
            }
        },
        computed:{     
        },
        props:[
            'token',
            'userId'
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
                        var url=`${this.userServicePath}/user/save`;
                        var method='POST';
                        //如果数据源里userid存在，改为update
                        if(this.formItem.userId){
                            url=`${this.userServicePath}/user/update`;
                            method='PUT';
                        }
                        //如果当前没选group，则清空所有group
                        if(this.targetKeys.length===0){
                            this.formItem.qaSysUserGroup = [];
                        }else{
                            debugger;
                            let groups = this.formItem.qaSysUserGroup; //取到已有group
                            let groupsId = []; //已有groupId数组
                            //遍历已有group，如果不存在于被选group里，删除,否则把已有group的groupsId取出来作为数组
                            for(let i=0;i<groups.length;i++){
                                if(!this.targetKeys.in_array(groups[i].groupId)){
                                    groups.splice(i,1);
                                    i--; //因为前面删除了第i位元素，后面的元素前移了一位，所以要i--
                                }else{
                                   groupsId.push(groups[i].groupId);
                                }
                            }
                            //遍历被选group，如果不存在于已有group里，添加进已有group里
                            for(let j=0;j<this.targetKeys.length;j++){
                                if(!groupsId.in_array(this.targetKeys[j])){
                                    groups.push({groupId:this.targetKeys[j]});
                                }
                            }
                        }
                        this.$axios({
                            url:url,
                            method:'post',
                            data:this.$qs.stringify({
                                user:JSON.stringify(this.formItem),
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
                                this.$router.push({name:`userEdit`,params:{token:this.token,userId:data.content.userId}});
                            }else{
                                this.$Notice.error({
                                    title: '保存失败',
                                    desc: data.message
                                });
                            }
                            //按钮设置为可用
                            this.isLoading = false;
                        }).catch((err)=>{
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
            //重置输入框（只有输入框的内容会被清除）
            handleReset (name) {
                this.$refs[name].resetFields();
                this.targetKeys = [];
            },
            //彻底清除数据，包括id
            clearAll(){
                //表单数据重置
                this.formItem={
                    userId:'',
                    userAccount:'',
                    userPassword:'',
                    confirmPassword:'',
                    userName:'',
                    userEmail:'',
                    userPhone:'',
                    userLdap:'',
                    qaSysUserGroup:[]
                },
                this.targetKeys = [];
            },
            //返回列表
            returnToList(){
                //触发切换菜单事件，把菜单切换到用户列表
                this.$emit('changeMenu','userList');
                //直接导航到新建
                this.$router.replace({name:`userList`,params:{token:this.token}});
            },
            //初始化方法
            init(userId){
                var id = userId?userId:this.userId;
                //如果是new，说明是新建，那么就clearall
                if(id==='new'){
                    this.clearAll();
                    this.notice = `正在新增用户`;
                }else if(id==='hold'){
                    //如果是hold，就啥也不干
                }else{
                    this.$axios({
                        url:`${this.userServicePath}/user/find/${id}`,
                        params:{
                            token:this.token
                        },
                        method:'get'
                    }).then((response)=>{
                        let data = response.data;
                        //返回success，登录成功
                        if(data.status==='success'){
                            this.formItem = data.content;
                            this.formItem.confirmPassword = this.formItem.userPassword;
                            this.notice = `正在编辑用户: ${this.formItem.userAccount}`;
                            //清空已选权限
                            this.targetKeys = [];
                            //获取当前用户的角色
                            let qaSysUserGroup = this.formItem.qaSysUserGroup;
                            //如果当前用户有角色，把这些角色放入已有角色里
                            if(qaSysUserGroup.length>0){
                                for(let i=0;i<qaSysUserGroup.length;i++){
                                    this.targetKeys.push(qaSysUserGroup[i].groupId);
                                }
                            }
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
            },
            ...email.methods, //邮箱自动补全方法
            //查询所有用户组的方法
            getGroupData(){
                this.$axios({
                    url:`${this.userServicePath}/group/findAll`,
                    method:'get',
                    params:{
                        token:this.token
                    },
                }).then((response)=>{
                    let data = response.data;
                    //返回success，登录成功
                    if(data.status==='success'){
                        //先清空已有的用户组
                        this.groupData = [];
                        //然后推入查询出的用户组
                        for(let i=0;i<data.content.length;i++){
                            this.groupData.push({key:data.content[i].groupId,label:`${data.content[i].groupName}`});
                        }
                    }else{
                        this.$Notice.error({
                            title: '查询用户组信息失败',
                            desc: data.message
                        });
                    }
                }).catch((err)=>{
                    this.$Notice.error({title: '查询用户组信息失败'});
                })
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                //获取用户组信息
                vm.getGroupData();
                //初始化
                vm.init();
            })
        },
        beforeRouteUpdate(to, from, next){
            this.init(to.params.userId);
        }
    }
</script>
