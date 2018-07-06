<style scoped>
.loginDiv{
    position: relative;
    width: 100%;
    height: 100%;
}
.loginTitle{
    top:20%;
    position: relative;
    text-align: center;
    color:black;
    font-size:60px;
}
.formLogin{
    width: 400px;
    height: 300px;
    background-color: white;
    padding: 20px 50px;
    margin: 0 auto;
    position: relative;
    top:45%;
    opacity: 0.9;
    transform: translateY(-60%);
    -ms-transform: translateY(-60%);
    -webkit-transform: translateY(-60%);
    -moz-transform: translateY(-60%);
    -o-transform: translateY(-60%);
}
.formLogin h1{
    text-align: center;
    margin-bottom: 20px;
}
.loginBtn{
    font:20px bold ;
    font-family: "Microsoft YaHei";
    margin-top:20px;
}
</style>

<template>
    <div class="loginDiv">
        <h1 class="loginTitle">智能顾问后台管理系统</h1>
        <Form ref="formLogin" :model="formLogin" :rules="ruleLogin" class='formLogin' id='formLogin'>
            <h1>登录</h1>
            <FormItem prop="username">
                <Input v-model="username" style="width: 300px" v-bind="usernameInputData">
                    <Icon v-bind="usernameIconData"/>
                </Input>
            </FormItem>
            <FormItem prop="password">
                <Input v-model="password" style="width: 300px" v-bind="passwordInputData" @on-enter="handleSubmit">
                    <Icon v-bind="passwordIconData"/>
                </Input>
            </FormItem>
            <FormItem>
                <Button v-bind="loginBtnData" :loading='loading' @click="handleSubmit" class='loginBtn'>登&nbsp&nbsp录</Button>
            </FormItem>
        </Form>
    </div>
</template>
<script>
    import store from '../../store/Login-store'
    import datas from '../../data/Login-data'
    import servicePaths from '../../router/path'
    // 在单独构建的版本中辅助函数为 Vuex.mapState
    import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
    
    export default {
        store,
        data () {
            return {
                ...datas,
                ...servicePaths()
            }
        },
        computed:{
            //vuex state map
			...mapState({
                'loading':state=>state.loading,
            }),
            //vuex getter map
			...mapGetters([
                'formLogin'
            ]),
            username:{
                get () {
                    return this.$store.state.username
                },
                set (value) {
                    this.$store.commit('updateUsername', value)
                }
            },
            password:{
                get () {
                    return this.$store.state.password
                },
                set (value) {
                    this.$store.commit('updatePassword', value)
                }
            },
        },
        methods:{
            ...mapMutations([
                'setLoading'
            ]),
            handleSubmit() {
                this.$refs['formLogin'].validate((valid) => {
                    //设置登录按钮在登录中
                    this.setLoading(true);
                    //前端验证
                    if (valid) {
                        this.$axios({
                            url:`${this.userServicePath}/Login/login`,
                            method:'post',
                            data: this.$qs.stringify({
                                account:this.$store.state.username,
                                password:this.$store.state.password
                            })
                        }).then((response)=>{
                            let data = response.data;
                            //返回success，登录成功
                            if(data.status==='success'){
                                //如果token不为空，说明登录成功
                                if(data.token!=null&&data.token!=''){
                                    this.$Message.success('登录成功，欢迎您!');
                                    //路由跳转到main
                                    this.$router.push({name: `main`,params:{token:data.token}});
                                }else{
                                    this.$Message.error(data.message);
                                }
                            }else{
                                this.$Message.error(data.message);
                            }
                            this.setLoading(false);
                        }).catch((err)=>{
                            this.$Message.error('登录失败!');
                            this.setLoading(false);
                        });
                    } else {
                        this.$Message.error('登录失败!');
                        //设置登录按钮登录不在登录中
                        this.setLoading(false);
                    }
                   
                })
            }
        },
        created () {
			// 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
        },
        beforeRouteEnter (to, from, next) {
			next(vm=>{
                vm.$$("#formLogin").css({top:'70%',opacity:'0.5'});
                vm.$$("#formLogin").animate({top:'45%',opacity:'0.9'},1000);
            });
		},
    }
</script>


