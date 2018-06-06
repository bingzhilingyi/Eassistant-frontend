<style scoped>
.hideFather{
    display: none;
};
</style>
<template>
    <div>
        <ButtonGroup :style="{marginBottom:'10px'}">
            <Button type="primary" @click="addChild" :loading='loading' :disabled="addDisabled">添加下级</Button>
            <Button type="primary" @click="loadData()" :loading='loading' :disabled="refreshDisabled">刷新</Button>
            <Button type="primary" @click="save" :loading='loading'>保存</Button>
            <Button type="warning" @click="deleteNode" :loading='loading' :disabled="delDisabled">删除</Button>
        </ButtonGroup>
        <Form :model="formItem" :label-width="80" ref="treeEdit" inline>
            <FormItem label="标题" prop="title">
                <Input v-model="formItem.title" style="width: 300px"></Input>
            </FormItem>
            <FormItem label="类型">
                <RadioGroup v-model="formItem.isPage">
                    <Radio label="Y">知识页</Radio>
                    <Radio label="N">节点</Radio>
                    <Tooltip content="知识页不能创建下级" placement="top">
                        <Icon type="ios-help-outline" size="18"></Icon>
                    </Tooltip>
                </RadioGroup>
                
            </FormItem>
            <FormItem label="父级" :class="hideFather">
                <b>{{formItem.parentName}}</b>
            </FormItem>
        </Form>
        <mavon-editor v-model="formItem.qaPage.content" ref="mvEditor"></mavon-editor>
    </div>
</template>
<script>
import servicePaths from '../router/path';
import my_ajax from '../util/ajax';
export default {
    data(){
        return{
            ...servicePaths(), //服务地址
            addDisabled:false, //添加按钮是否可用
            delDisabled:false, //删除按钮是否可用
            refreshDisabled:false, //刷新按钮是否可用
            hideFather:'hideFather', //父级的类
            loading:false, //按钮是否在加载中
            formItem:{
                qaPage:{}
            }
        }
    },
    computed:{},
    methods:{
        //加载节点信息，如果传入id，则加载该id的信息
        loadData(id){
            //如果传入的id为空，使用当前路由的id
            var treeId = id;
            if(!treeId){
                treeId = this.treeId;
            }
            //如果是新建，则不查询数据,且只使用保存按钮
            if(treeId=='new'){
                //定义新增的初始数据
                this.formItem = {
                    title:'', 
                    isPage:'N', 
                    parentId:this.$route.query.parentId,
                    parentName:this.$route.query.parentName,
                    qaPage:{
                        content:'# 请输入内容'
                    }
                }
                //显示父级
                this.hideFather = '';
                //失效按钮
                this.addDisabled = true;
                this.refreshDisabled = true;
                this.delDisabled = true;
                return;
            }else{
                //隐藏父级
                this.hideFather = 'hideFather';
                //使所有按钮生效
                this.addDisabled = false;
                this.refreshDisabled = false;
                this.delDisabled = false;
            }
            //按钮设置为不可用
            this.loading = true;
            var that = this;
            my_ajax({
                url:`${this.userServicePath}/tree/getById/${treeId}`,
                data:{
                    token:this.token
                },
                success:function(data){
                        if(data&&data.status=='success'){
                            //查询结果设置为表单
                            that.formItem = data.content;
                            //如果查询结果不含page信息，就初始化page为空对象
                            if(!that.formItem.qaPage){
                                that.formItem.qaPage = {};
                            };
                            //如果是页面，使添加下级按钮不可用
                            if(that.formItem.isPage=='Y'){
                                that.addDisabled = true;
                            }
                            //如果当前节点是根节点，不允许删除
                            if(that.formItem.parentId==0){
                                that.delDisabled = true;
                            }
                            //隐藏父级显示
                            this.hideFather = 'hideFather';
                        }else{
                            that.$Notice.error({
                                title: '节点信息查询失败',
                                desc: data.message
                            });
                        }
                    },
                    error:function(e){
                        that.$Notice.error({
                            title: '查询节点信息出现异常'
                        });
                    },
                    complete:function(){
                        that.loading = false;
                    }
            })
        },
        //保存节点信息变更
        save(){
            //默认为update，如果是新建，更换为save
            var type = this.treeId=='new'?'save':'update';
            var method = this.treeId=='new'?'POST':'PUT';
            //把页面title设置为节点title，并验证title是否存在
            if(!this.formItem.title){
                this.$Notice.error({
                    title: '标题不能为空！'
                });
                return;
            }
            this.formItem.qaPage.title = this.formItem.title;
            this.formItem.qaPage.htmlContent = this.$refs.mvEditor.d_render;
            console.log(this.$refs.mvEditor.d_render);
            //按钮设为不可用
            this.loading = true;
            var that = this;
            my_ajax({
                url:`${this.userServicePath}/tree/${type}`,
                data:{
                    node:JSON.stringify(this.formItem),
                    token:this.token,
                    _method: method
                },
                type:'POST',
                success:function(data){
                    if(data&&data.status=='success'){
                        that.$Notice.success({
                            title: '保存成功',
                            desc: data.message
                        });
                        //触发更新树事件
                        that.$emit('updateTree',data.content);
                        //导航到新保存的页面
                        that.$router.push({name:'nodeview',params:{token:that.token,treeId:data.content.treeId}});
                    }else{
                        that.$Notice.error({
                            title: '保存失败',
                            desc: data.message
                        });
                    }
                },
                error:function(e){
                    that.$Notice.error({
                        title: '保存出现异常'
                    });
                },
                complete:function(){
                    that.loading = false;
                }
            })
        },
        //删除节点
        deleteNode(){
            //按钮设为不可用
            this.loading = true;
            var that = this;
            my_ajax({
                    url:`${this.userServicePath}/tree/delete`,
                    data:{
                        token:this.token,
                        id:this.treeId,
                        _method: 'DELETE'
                    },
                    type:'POST',
                    success:function(data){
                        if(data&&data.status=='success'){
                            that.$Notice.success({
                                title: '删除成功',
                                desc: data.message
                            });
                            //触发删除节点事件
                            that.$emit('deleteNode',that.treeId);
                        }else{
                            that.$Notice.error({
                                title: '删除失败',
                                desc: data.message
                            });
                        }
                    },
                    error:function(e){
                        that.$Notice.error({
                            title: '删除出现异常'
                        });
                    },
                    complete:function(){
                        that.loading = false;
                    }
            })
            
        },
        //添加下级
        addChild(){
            var parentId = this.formItem.treeId;
            var parentName = this.formItem.title;
            //路由到添加下级
            this.$router.push({
                name:'nodeview',
                params:{token:this.token,treeId:'new'},
                query:{
                    parentId:parentId,
                    parentName:parentName
                }
            });
        }
    },
    props:['token','treeId'],
    watch:{
        //监控路由，如果改变了就从新加载数据
        // '$route':function(){
        //     this.loadData(this.$route.params.treeId);
        // }
    },
    //每次进入路由调用
    beforeRouteEnter (to, from, next) {
        //回调函数，当组件加载完毕后调用
        next(vm => {
            vm.loadData();
        })
    },
    //组建创建成功调用
    created(){
    },
    //组建更新时调用
    beforeRouteUpdate (to, from, next) {
        this.loadData(to.params.treeId);
        next();
    },
}
</script>

