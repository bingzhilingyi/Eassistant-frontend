<style scoped>	
</style>

<template>
    <div>
        <Input v-model="searchValue" placeholder="请输入账号或姓名进行查询..." size='large'>
            <Button slot="prepend" @click="gotoUserAdd">点我添加新用户</Button>
            <Button slot="append" icon="ios-search" @click="searchUser"></Button>
        </Input>
        <br>
        <Table :columns="userColumn" :data="userData" :loading="isLoading" stripe border></Table>
        <br>
        <div style="float: right;">
            <Page :total="totalElements" :current="currentPage" :page-size="pageSize" @on-change="changePage" show-total show-elevator size="small"></Page>
        </div>
        <!-- 删除用户的提示框 -->
        <Modal v-model="showDeleteWarn" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>删除提醒</span>
            </p>
            <div style="text-align:center">
                <p>用户删除将无法恢复！</p>
                <p>您确定要删除该用户吗?</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long  @click="remove(rowIndex)">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import my_ajax from '../util/ajax';
    import servicePaths from '../router/path'
    import store from '../store/UserList-store'
    import deepCopy from '../util/deepCopy'
    // 在单独构建的版本中辅助函数为 Vuex.mapState
    import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
	export default {
        store,
		data(){
			return {
                ...servicePaths(),
                searchValue: '', //查询条件
                userColumn : [
                    {
                        title: 'ID',
                        key: 'userId'
                    },
                    {
                        title: '账号',
                        key: 'userAccount'
                    },
                    {
                        title: '姓名',
                        key: 'userName'
                    },
                    {
                        title: '邮箱',
                        key: 'userEmail'
                    },
                    {
                        title: '电话',
                        key: 'userPhone'
                    },
                    {
                        title: 'ldap账号',
                        key: 'userLdap'
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.editUser(params.index)
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            //显示确认删除窗口
                                            this.setShowDeleteWarn(true);
                                            //设置当前数据行
                                            this.setRowIndex(params.index);
                                        }
                                    }
                                }, '删除')
                            ])
                        }
                    }
                ],
                //表格内容定义
                userData: [],
			}
        },
        computed:{
            //vuex state map
			...mapState([
                'historyValue', //上一次查询条件
                'totalElements', //总条目数
                'currentPage', //当前页
                'pageSize', //每页大小
                'isLoading',  //是否正在查询
                'rowIndex' //正在操作的表格行数
            ]),
            //vuex getter map
			...mapGetters([
            ]),
            showDeleteWarn:{
                get () {
                    return this.$store.state.showDeleteWarn
                },
                set (value) {
                    this.$store.commit('setShowDeleteWarn', value)
                }
            }
        },
		props:['token'],
        methods:{
            //vuex mutations map
            ...mapMutations([
                'setLoading', //设置是否在加载
                'setHistoryValue', //设置历史查询数据
                'setTotalElements', //设置总条目数
                'setCurrentPage', //设置当前页
                'setPageSize', //设置每页大小
                'setShowDeleteWarn', //设置是否显示删除框
                'setRowIndex'  //当前转中行
            ]),
            //查询方法
            searchUser(){
                //表格设置为加载中
                this.setLoading(true);
                //默认查询结果不为slice，即不需要查询总数量
                var isSlice = false;
                //如果历史查询条件存在且与现在的一样，说明只是翻页，不需要再获取总条目数量，这样就加上isSlice=true,加快效率
                if(this.historyValue&&this.historyValue===this.searchValue){
                    isSlice = true;
                }
                //把现在的查询条件传给历史查询条件
                this.setHistoryValue(this.searchValue)
                
                var that = this;
                my_ajax({
                    url:`${this.userServicePath}/user/findPagedByAccountOrName`,
                    data:{
                        account:this.searchValue, //查询条件
                        page:this.currentPage-1, //实际页从0开始，所以要-1
                        size:this.pageSize, //每页大小
                        isSlice:isSlice, //是否是翻页
                        token:this.token
                    },
                    success:function(data){
                        //返回success，登录成功
                        if(data.status==='success'){
                            //接收数据
                            that.userData = data.content;
                            //如果查询条件isSlice==false时，更新总条目数
                            if(!isSlice){
                                that.setTotalElements(data.totalElements)
                            }
                        }else{
                            that.$Notice.error({
                                title: '查询失败',
                                desc: data.message
                            });
                        }
                    },
                    error:function(e){
                        that.$Notice.error({
                            title: '查询出现异常',
                            desc: ''
                        });
                    },
                    complete:function(){
                        //表格设置为未加载
                        that.setLoading(false);
                    }
                })
            },
            //翻页方法
            changePage(p){
                this.setCurrentPage(p);
                this.searchUser();
            },
            //跳到用户编辑页
            editUser (index) {
                //触发切换菜单事件，把菜单切换到用户编辑
                this.$emit('changeMenu','userAdd');
                //复制一个新对象，不能直接原始数据
                var userToEdit = deepCopy(this.userData[index]);
                //导航到用户编辑页，传需要编辑的userid
                this.$router.push({name:`userAdd`,params:{token:this.token,userToEdit:userToEdit}});
            },
            //删除用户
            remove (index) {
                var id = this.userData[index].userId;
                var that = this;
                my_ajax({
                    url:`${this.userServicePath}/user/delete/${id}`,
                    data:{
                        token:this.token,
                        _method: 'DELETE'
                    },
                    type:"POST",
                    success:function(data){
                        //返回success，删除成功
                        if(data.status==='success'){
                            that.$Notice.success({
                                title: '删除成功',
                                desc: '用户已成功删除'
                            });
                            //总数减一
                            that.setTotalElements(that.totalElements-1);
                            //把这行数据删掉
                            that.userData.splice(index, 1);
                        }else{
                            that.$Notice.error({
                                title: '删除失败',
                                desc: data.message
                            });
                        }
                    },
                    error:function(e){
                        that.$Notice.error({
                            title: '删除出现异常',
                            desc: ''
                        });
                    },
                    complete:function(){
                        //隐藏删除提示窗口
                        that.setShowDeleteWarn(false)
                    }
                })
            },
            //跳转到添加新用户
            gotoUserAdd(){
                //触发切换菜单事件，把菜单切换到用户编辑
                this.$emit('changeMenu','userAdd');
                //导航到新增用户
                this.$router.push({name:`userAdd`,params:{token:this.token}});
            }
        }
	}
</script>

