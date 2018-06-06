<style scoped>
.formContainer{
    width:400px;
    margin: 0 auto;
}
</style>

<template>
    <div class="formContainer">
        <Form :model="formItem"  :rules="ruleValidate" :label-width="80" ref="UserAdd">
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
            <FormItem>
                <Button type="primary" @click="handleSubmit('UserAdd')" :loading='isLoading'>保存并提交</Button>
                <Button type="ghost" @click="handleReset('UserAdd')" style="margin-left: 8px" :loading='isLoading'>重置</Button>
                <Button type="primary" @click="newUser" :loading='isLoading' style="margin-left: 8px">返回列表</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script>
    import my_ajax from '../util/ajax';
    import servicePaths from '../router/path';
    import email from '../util/email'; //邮箱自动提示的方法
    export default {
        data(){
            const validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else {
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
                formItem:{},
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
                }
            }
        },
        computed:{
        },
        props:[
            'token',
            'userToEdit' //如果是用户编辑，将会传入需要编辑的用户的对象
        ],
        methods:{
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    var that = this;
                    //按钮设置为加载中
                    this.isLoading = true;
                    if (valid) {
                        //预设url和type
                        var url=`${this.userServicePath}/user/save`;
                        var method='POST';
                        //如果是编辑，改变url和method
                        if(this.userToEdit){
                            url=`${this.userServicePath}/user/update`;
                            method='PUT';
                        }
                        my_ajax({
                            url:url,
                            data:{
                                user:JSON.stringify(that.formItem),
                                token:this.token,
                                _method: method
                            },
                            type:'POST',
                            success:function(data){
                                //返回success，登录成功
                                if(data.status==='success'){
                                    that.$Notice.success({
                                        title: '保存成功',
                                        desc: '用户已成功保存'
                                    });
                                    //赋值返回的id
                                    that.formItem.userId = data.content.userId;
                                }else{
                                    that.$Notice.error({
                                        title: '保存失败',
                                        desc: data.message
                                    });
                                }
                            },
                            error:function(e){
                                that.$Notice.error({
                                    title: '保存失败',
                                    desc: e.responseJSON?e.responseJSON.message:''
                                });
                            },
                            complete:function(){
                                //按钮设置为可用
                                that.isLoading = false;
                            }
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
                    userLdap:''
                }
            },
            newUser(){
                //直接导航到新建
                this.$router.replace({name:`userList`,params:{token:this.token}});
            },
            ...email.methods, //邮箱自动补全方法
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                // 通过 `vm` 访问组件实例
                //如果收到了userToEdit，说明是编辑
                if(vm.userToEdit){
                    vm.formItem = vm.userToEdit;
                    vm.formItem.confirmPassword = vm.formItem.userPassword;
                }else{
                    //如果是新建，初始化表单
                    vm.clearAll();
                }
            })
        }
    }
</script>
