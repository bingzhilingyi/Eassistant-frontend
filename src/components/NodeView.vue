<style>
.hideFather{
    display: none !important;
}
.notice{
    line-height: 24px;
    color:rgb(248, 60, 116);
    font-size: 14px;
    font-weight: bold;
    padding-left: 30px;
}
.v-note-wrapper{
    z-index:999 !important;
}
</style>
<template>
    <div>
        <ButtonGroup :style="{marginBottom:'10px'}">
            <Button type="primary" @click="addChild" :loading='loading' :disabled="addDisabled">添加下级</Button>
            <Button type="primary" @click="changeParent" :loading='loading' :disabled="changeParentDisabled">变更上级</Button>
            <Button type="primary" @click="loadData()" :loading='loading' :disabled="refreshDisabled">刷新</Button>
            <Button type="primary" @click="save" :loading='loading'>保存</Button>
            <Button type="warning" @click="deleteNode" :loading='loading' :disabled="delDisabled">删除</Button>
            <span class="notice" :class="hideFather">如保存后左侧树没有更新，请刷新网页</span>
        </ButtonGroup>
        <Form :model="formItem" :label-width="60" :rules="ruleNode" ref="treeEdit" inline>
            <FormItem label="标题" prop="title">
                <Input v-model="formItem.title" style="width: 200px"></Input>
            </FormItem>
            <FormItem label="类型">
                <RadioGroup v-model="formItem.isPage">
                    <Radio label="Y">知识页</Radio>
                    <Radio label="N">节点</Radio>
                    <Tooltip content="知识页不能创建下级" placement="top" :style="{verticalAlign:'sub'}">
                        <Icon type="ios-help-outline" size="18"></Icon>
                    </Tooltip>
                </RadioGroup>
            </FormItem>
            <FormItem label="热度">
                <b style="color:red">{{formItem.rank}}</b>
            </FormItem>
            <FormItem label="域" prop="domain">
                <Input v-model="formItem.domain" style="width: 100px" :disabled="domainDisabled"></Input>
            </FormItem>
            <FormItem label="父级" :class="hideFather">
                <b>{{formItem.parentName}}</b>
            </FormItem>
        </Form>
        <mavon-editor v-model="formItem.qaPage.content" ref="mvEditor" @imgAdd="$imgAdd"></mavon-editor>
    </div>
</template>
<script>
import servicePaths from '../router/path';
import my_ajax from '../util/ajax.js'
export default {
    data(){
        return{
            ...servicePaths(), //服务地址
            addDisabled:false, //添加按钮是否可用
            delDisabled:false, //删除按钮是否可用
            refreshDisabled:false, //刷新按钮是否可用
            changeParentDisabled:false,//变更上级是否可用
            domainDisabled:true,//域是否可填写
            hideFather:'hideFather', //父级的类
            loading:false, //按钮是否在加载中
            formItem:{
                qaPage:{}
            },
            newParent:{}, //新选择的父级
            ruleNode:{
                //domain:[{required:true,message:'域不能为空！'}],
                title:[{required:true,message:'标题不能为空！'}]
            }
        }
    },
    computed:{},
    methods:{
        //加载节点信息，如果传入id，则加载该id的信息
        loadData(to){
            //如果传入了to，说明是路由update，那么取to的treeId,否则用自己的treeid
            var treeId = to?to.params.treeId:this.treeId;
            //如果是新建，则不查询数据,且只使用保存按钮
            if(treeId=='new'){
                let parentId = this.$route.query.parentId; //父级id
                let parentName = this.$route.query.parentName; //父级名称
                let parentDomain = this.$route.query.parentDomain; //父级域，子集继承父级的域
                //如果传入了to，就使用to的数据
                if(to&&to.query){
                    parentId = to.query.parentId;
                    parentName = to.query.parentName;
                    parentDomain = to.query.parentDomain;
                }
                //定义新增的初始数据
                this.formItem = {
                    title:'', 
                    isPage:'N', 
                    parentId:parentId,
                    parentName:parentName,
                    rank:0,
                    domain:parentDomain,
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
                this.changeParentDisabled = true;
                //如果新建的是根节点，域可编辑，否则不允许编辑域
                this.domainDisabled = parentId!=0;
                return;
            }else{
                //隐藏父级
                this.hideFather = 'hideFather';
                //使所有按钮生效
                this.addDisabled = false;
                this.refreshDisabled = false;
                this.delDisabled = false;
                this.changeParentDisabled = false;
                //不允许编辑域
                this.domainDisabled = true;
            }
            //按钮设置为不可用
            this.loading = true;
            
            this.$axios({
                url:`${this.userServicePath}/tree/findById/${treeId}`,
                params:{
                    token:this.token
                },
                method:'get'
            }).then((Response)=>{
                let data = Response.data;
                if(data&&data.status=='success'){
                    //查询结果设置为表单
                    this.formItem = data.content;
                    //如果查询结果不含page信息，就初始化page为空对象
                    if(!this.formItem.qaPage){
                        this.formItem.qaPage = {};
                    };
                    //如果是页面，使添加下级按钮不可用
                    if(this.formItem.isPage=='Y'){
                        this.addDisabled = true;
                    }
                    //如果当前节点是根节点，不允许删除,不允许变更上级
                    if(this.formItem.parentId==0){
                        this.delDisabled = true;
                        this.changeParentDisabled = true;
                    }
                    //隐藏父级显示
                    this.hideFather = 'hideFather';
                }else{
                    this.$Notice.error({
                        title: '节点信息查询失败',
                        desc: data.message
                    });
                }
                this.loading = false;
            }).catch((err)=>{
                this.$Notice.error({
                    title: '查询节点信息出现异常'
                });
                this.loading = false;
            })
        },
        //保存节点信息变更
        save(){
            this.$refs['treeEdit'].validate((valid) => {
                //按钮设为不可用
                this.loading = true;
                if(valid){
                    //默认为update，如果是新建，更换为save
                    var type = this.treeId=='new'?'save':'update';
                    var method = this.treeId=='new'?'POST':'PUT';
                    //把标题里的所有空格去掉
                    var reg = new RegExp(" ","g");//g,表示全部替换。
                    var title = this.formItem.title.replace(reg,"");
                    this.formItem.title = title;
                    this.formItem.qaPage.title = this.formItem.title;
                    //取到md的html内容作为页面的htmlContent
                    this.formItem.qaPage.htmlContent = this.$refs.mvEditor.d_render;
                    //发起保存请求
                    this.$axios({
                        url:`${this.userServicePath}/tree/${type}`,
                        data:this.$qs.stringify({
                            node:JSON.stringify(this.formItem),
                            token:this.token,
                            _method: method
                        }),
                        method:'post'
                    }).then((Response)=>{
                        let data = Response.data;
                        if(data&&data.status=='success'){
                            this.$Notice.success({
                                title: '保存成功',
                                desc: data.message
                            });
                            //触发更新树事件
                            this.$emit('updateTree',data.content);
                            //导航到新保存的页面
                            this.$router.push({name:'nodeview',params:{token:this.token,treeId:data.content.treeId}});
                        }else{
                            this.$Notice.error({
                                title: '保存失败',
                                desc: data.message
                            });
                        }
                        this.loading = false;
                    }).catch((err)=>{
                        this.$Notice.error({
                            title: '保存出现异常'
                        });
                        this.loading = false;
                    })
                }else {
                    this.$Message.error('保存失败，请检查输入信息');
                    //设置登录按钮登录不在登录中
                    this.loading = false;
                }
            })
        },
        //删除节点
        deleteNode(){
            //按钮设为不可用
            this.loading = true;

            this.$axios({
                url:`${this.userServicePath}/tree/delete`,
                data:this.$qs.stringify({
                    token:this.token,
                    id:this.treeId,
                    _method: 'DELETE'
                }),
                method:'post'
            }).then((Response)=>{
                let data = Response.data;
                if(data&&data.status=='success'){
                    this.$Notice.success({
                        title: '删除成功',
                        desc: data.message
                    });
                    //触发删除节点事件
                    this.$emit('deleteNode',this.treeId);
                }else{
                    this.$Notice.error({
                        title: '删除失败',
                        desc: data.message
                    });
                }
                this.loading = false;
            }).catch((err)=>{
                this.$Notice.error({
                    title: '删除出现异常'
                });
                this.loading = false;
            })
        },
        //添加下级
        addChild(){
            var parentId = this.formItem.treeId;
            var parentName = this.formItem.title;
            var parentDomain = this.formItem.domain;
            //路由到添加下级
            this.$router.push({
                name:'nodeview',
                params:{token:this.token,treeId:'new'},
                query:{
                    parentId:parentId, //父级id
                    parentName:parentName, //父级名称（用于显示）
                    parentDomain:parentDomain //父级的域，继承给子集
                }
            });
        },
        // 上传图片
        $imgAdd(pos, $file){
            //图片不允许大于2M
            if($file&&$file.size&&$file.size>2097152){
                this.$Notice.error({
                    title: '图片上传失败',
                    desc:'图片大小不能超过2M'
                });
                return;
            }
            // 第一步.将图片上传到服务器.
            var formdata = new FormData();
            formdata.append('image', $file);
            this.$axios({
                url: `${this.userServicePath}/tree/upload`,
                method: 'post',
                params:{
                    token:this.token
                },
                data: formdata,
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then((Response) => {
                let data = Response.data;
                // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
                // $vm.$img2Url 详情见本页末尾
                this.$refs.mvEditor.$img2Url(pos, data.content);
            })
        },
        // $imgDel(pos){
        //     delete this.img_file[pos];
        // },
        //更换上级的方法
        changeParent(){
            //如果是新建或本身是根目录
            if(this.treeId==='new'||this.formItem.parentId===0){
                this.$Message.error('根节点不允许变更父级！');
                return;
            };
            //触发更换上级事件
            this.$emit('changeParent',true);
            //按钮全部设置为加载中
            this.loading = true;
            //弹出提示
            this.$Notice.warning({
                name:'changeParent',
                title: '变更上级',
                duration: 0 , //设为0，不关闭该提示框
                render: h => {
                    return h('span', {
                        style:{
                            lineHeight:'30px'
                        }
                    },[
                        h('p',{
                            
                        },[
                            `请在左侧层级树里选中某节点，再点击确定`,
                            h('p',[
                                '当前选中的父级为:',
                                h('b',{
                                    style:{
                                        color:'#2d8cf0'
                                    }
                                },this.newParent.title)
                            ])
                        ]),
                        h('Button',{
                            props:{
                                type:'primary',
                            },
                            style:{
                                marginRight:'10px'
                            },
                            on: {
                                click: ()=>{
                                    //确保如下条件：
                                    //  1.新父级不为空
                                    //  2.新父级不是自己
                                    //  3.新父级不是知识页
                                    //  4.新父级不是别的域
                                    if(!this.newParent.treeId){
                                        this.$Notice.error({title:'还未选择父级！'});
                                        return;
                                    } else if(this.formItem.treeId==this.newParent.treeId){
                                        this.$Notice.error({title:'不能选自己为新父级！'});
                                        return
                                    }else if(this.formItem.domain!=this.newParent.domain){
                                        this.$Notice.error({title:'不能选择别的域作为父级！'});
                                        return
                                    }else if(this.newParent.isPage=='Y'){
                                        this.$Notice.error({title:'不能选知识页作为父级！'});
                                        return
                                    }
                                    //保存变更
                                    this.formItem.parentId = this.newParent.treeId;
                                    this.save();
                                    //关闭该提示
                                    this.$Notice.close('changeParent');
                                    //提示刷新
                                    this.$Notice.info({title:'请刷新网页以获取最新层级'});
                                    //触发取消变更父级事件
                                    this.$emit('changeParent',false);
                                    //清除已经选择过的父级
                                    this.newParent = {};
                                }
                            },
                        },'确定'),
                        h('Button',{
                            on: {
                                //点击取消就关闭这个提醒
                                click: ()=>{
                                    //触发取消变更父级事件
                                    this.$emit('changeParent',false);
                                    //清除已经选择过的父级
                                    this.newParent = {};
                                    //关闭该提示
                                    this.$Notice.close('changeParent');
                                    //按钮可用
                                    this.loading = false;
                                } 
                            },
                        },'取消')
                    ])
                },
                onClose:()=>{}
            });
        },
    },
    props:['token','treeId'],
    watch:{},
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
        this.loadData(to);
        next();
    },
}
</script>

