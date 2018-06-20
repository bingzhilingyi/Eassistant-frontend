<style scoped>
.btnGroup{
    padding-bottom:10px;
    height:50px;
}
.searchedData li{
    list-style-type:none;
    padding:5px 10px;
    cursor: pointer;
}
.hide{
    display: none;
}
</style>
<template>
    <div>
        <Layout :style="{minHeight:'460px',height:'inherit'}">
            <Sider :style="{backgroundColor:'#fff'}">
                <div>
                        <AutoComplete v-model="title" :data="AutoCompleteData" @on-search="handleComplete" placeholder="请输入标题..." 
                        style="display:none;width:140px" id="btn1"></AutoComplete>
                        <Button type="primary" shape="circle" icon="ios-search" @click="searchNode" long :loading="isLoading"
                        style="display:inline-block;width:150px" id="btn2">{{message}}</Button>
                </div>
                <div :class="{'hide':isHide}">
                    <ul class="searchedData">
                        <li v-for="{title,treeId} in searchedData"  :key="treeId">
                            <a @click="selectPageById(treeId)">{{title}}</a>
                        </li>
                    </ul>
                    <p>共查出<span style="color:red">{{searchedTotal}}</span>条数据,
                        显示前<span style="color:red">{{searchedDataLength}}</span>条
                        <a @click="hideSearch">[收起]</a>    
                    </p>
                </div>
                <div style="overflow:auto;padding-top:20px">
                    <Button type="warning" @click="addRoot">添加根节点</Button>
                    <Tree :data="treeData" :load-data="loadData" ref="tree" :render="renderContent"></Tree>
                </div>
            </Sider>
            <Content :style="{overflow:'auto',padding: '1px', background: '#fff'}">
                <keep-alive>
                    <router-view @updateTree="OnUpdateTree" @deleteNode="onDeleteNode"></router-view>
                </keep-alive>
            </Content>
        </Layout>
    </div>  
</template>
<script>
    import autocomplete from '../util/autoComplete';
    import servicePaths from '../router/path';
    import $ from 'jquery';
    export default {
        data () {
            return {
                ...servicePaths(), //服务地址
                ...autocomplete.data(), //自动完成的数据定义
                isHide:true, //查询结果框是否隐藏
                isLoading:false, //查询按钮是否可用
                title:'', //查询的标题
                searchedData:[], //查询到的数据
                searchedTotal:0, //查询到数据的总数
                message:'点我可以查询', //按钮上的字
                selectedItem:[], //被选中的节点
                treeData:[] //树的数据源
            }
        },
        computed:{
            searchedDataLength(){
                return this.searchedData.length;
            }
        },
        methods:{
            //自动提示的方法
            ...autocomplete.methods,
            //加载下级节点的方法
            loadData (item, callback) {
                this.loadTree(item.treeId,callback);
            },
            //通过父id读取子节点
            loadTree (parentId,callback){
                this.$axios({
                    url:`${this.userServicePath}/tree/getByParentId/${parentId}`,
                    params:{
                        token:this.token
                    },
                    method:'get'
                }).then((response)=>{
                    let data = response.data;
                    if(data&&data.status=='success'){
                        var content = new Array();
                        for(let i=0;i<data.content.length;i++){
                            let d = data.content[i];
                            //如果不是页面，则添加children属性
                            if(d.isPage==='N'){
                                d.children = [];
                                d.loading = false;
                            }
                            content.push(d);
                        }
                        callback(content);
                    }else{
                        this.$Notice.error({
                            title: '层级树查询失败',
                            desc: data.message
                        });
                    }
                }).catch((err)=>{
                    this.$Notice.error({
                        title: '查询出现异常',
                        desc: ''
                    });
                });
            },
            //点击选中页面的方法
            selectPage(item){
                if(item){
                    if(this.selectedItem.treeId){
                        this.$$("#qaTree_"+this.selectedItem.treeId).css('background-color','');
                    }
                    this.selectedItem = item;
                    this.$$("#qaTree_"+this.selectedItem.treeId).css('background-color','#2d8cf038');
                    this.$router.push({name:'nodeview',params:{token:this.token,treeId:item.treeId}});
                }else{
                    this.$router.push({name:'tree',params:{token:this.token}});
                }
            },
            //通过id查找页面的方法
            selectPageById(treeId){
                this.$router.push({name:'nodeview',params:{token:this.token,treeId:treeId}});
            },
            //删除节点
            onDeleteNode(treeId){
                //取到tree的所有数据
                var data = this.$refs.tree.data;
                //从这些数据里找treeid的父级
                var fatherInfo = this.getFather(data,treeId);
                //如果找到了父级，就从父级里删除该数据
                if(fatherInfo&&fatherInfo.data){
                    fatherInfo.data.splice(fatherInfo.index,1);
                }
                //路由到tree
                this.$router.push({name:'tree',params:{token:this.token}});
            },
            //遍历传入的数据，找到指定节点的父级
            getFather(data,treeId){
                for(let i=0;i<data.length;i++){
                    let a = data[i].treeId;
                    //这里不能写===，因为treeId传过来是string不是number
                    if(a==treeId){
                        let d = {};
                        //找到并返回
                        d.data = data;
                        d.index = i;
                        return d;
                    }else if(data[i].children&&data[i].children.length>0){
                        //如果有子集，就再去搜索子集
                        let t = this.getFather(data[i].children,treeId);
                        if(t){
                            return t;
                        }
                    }
                }
            },
            //更新树的数据
            OnUpdateTree(data){
                //取到返回数据的id
                var treeId = data.treeId;
                var parentId = data.parentId;
                var selectedItem = this.selectedItem[0];
                //如果当前有选中的项,且选中的项就是被保存的项，更新一下信息
                if(this.selectedItem.length>0&&selectedItem.treeId==treeId){
                    selectedItem.title = data.title;
                    selectedItem.isPage = data.isPage;
                }else if(this.selectedItem.length>0&&selectedItem.treeId==parentId){
                    //如果选中的是它的父级，那么就先判断父级里有没有它，没有就加上
                    if(selectedItem.children.length>0){
                        let isExists = false;
                        let index = 0;
                        //遍历子集，看是否存在该节点
                        for(let i=0;i<selectedItem.children.length;i++){
                            if(selectedItem.children[i].treeId==treeId){
                                isExists = true;
                                index = i;
                            }
                        }
                        //如果存在，更新数据，不存在，添加数据
                        if(isExists){
                            selectedItem.children[i].title = data.title;
                            selectedItem.children[i].isPage = data.isPage;
                        }else{
                            selectedItem.children.push(data);
                        }
                    }
                }else{
                    //否则遍历树的数据，查找到当前节点并修改
                    //取到tree的所有数据
                    var treeData = this.$refs.tree.data;
                    //从这些数据里找treeid的父级
                    var fatherInfo = this.getFather(treeData,treeId);
                    //如果找到了父级，就从父级里修改该数据,否则，查找父级的父级
                    if(fatherInfo&&fatherInfo.data){
                        fatherInfo.data[fatherInfo.index].title=data.title;
                    }else{
                        // var grantInfo = this.getFather(treeData,parentId);
                        // if(grantInfo&&grantInfo.data){
                        //     grantInfo.data[grantInfo.index].children.push(data);
                        // }
                    }
                }
            },
            //查询方法
            searchNode(){
                //如果按钮有字，说明还未出现查询框，则显示查询框并清楚按钮的文字
                if(this.message){
                    this.toggelSearch(true);
                }else{
                    this.isHide = false;
                    this.isLoading = true;
                    this.$axios({
                        url:`${this.userServicePath}/tree/getPagedByTitleLike`,
                        params:{
                            token:this.token,
                            title:this.title,
                            page:0, //默认只查前10个
                            size:10
                        },
                    }).then((response)=>{
                        let data = response.data;
                        if(data&&data.status=='success'){
                            //接收数据
                            this.searchedData = data.content;
                            this.searchedTotal = data.totalElements;
                        }else{
                            this.$Notice.error({
                                title: '查询失败',
                                desc: data.message
                            });
                        }
                        this.isLoading = false;
                    }).catch((err)=>{
                        this.$Notice.error({
                            title: '查询出现异常'
                        });
                        this.isLoading = false;
                    })
                }
            },
            //是否显示查询框
            toggelSearch(isShow){
                if(isShow){
                    this.message = '';
                    $("#btn1").show(300);
                    $("#btn2").animate({width:'50px'},300);
                }else{
                    this.message = '点我可以查询';
                    $("#btn1").hide(300);
                    $("#btn2").animate({width:'150px'},300);
                }
            },
            //自动补全方法
            handleComplete(value){
                this.AutoCompleteData = []
                //遍历数据源，如果存在要搜索的字符串，就加入data里
                for(let i=0;i<this.AutoCompleteDataSource.length;i++){
                    if(value&&this.AutoCompleteDataSource[i].toUpperCase().indexOf(value.toUpperCase()) !== -1){
                        this.AutoCompleteData.push(this.AutoCompleteDataSource[i]);
                    }
                }
            },
            //清空查询数据并隐藏查询框
            hideSearch(){
                this.searchedData = [];
                this.searchedTotal = 0;
                this.isHide = true;
                this.toggelSearch(false);
            },
            //添加根节点
            addRoot(){
                this.$router.push({
                    name:'nodeview',
                    params:{token:this.token,treeId:'new'},
                    query:{
                        parentId:0,
                        parentName:"根节点"
                    }
                });
            },
            renderContent (h, { root, node, data }) {
                return h('span',{
                        style:{
                            cursor:'pointer',
                            display:'inline-block'
                        },
                        attrs: {
                            id: 'qaTree_'+node.node.treeId
                        },
                        on: { 
                            click: () => {
                                //选中该节点
                                this.selectPage(node.node) 
                            }
                        }
                    },[
                    h('Icon', {
                        props: {
                            type: ((isPage)=>{ //根据是否是节点来加载不同的图标
                                if(isPage==='Y'){
                                    return 'ios-paper-outline';
                                }else{
                                    return 'ios-folder-outline';
                                }
                            })(node.node.isPage)
                        },
                        style: {
                            marginRight: '8px'
                        }
                    }),
                    h('span', data.title),
                    h('span',{
                            style:{
                                color:'rgb(248, 60, 116)',
                                marginLeft:'10px'
                            }
                        },
                        `${data.rank}`
                    )
                ])
            }
        },
        props:['token'],
        created(){
            //定义回调方法
            var setTreeData = (data)=>{
                this.treeData = data;
            }
            //加载根目录
            this.loadTree(0,setTreeData);
            
            //查找排名最高的100个页面
            this.$axios({
                url: `${this.userServicePath}/client/findTopRank`,
                params: {
                    size: 100,
                    token: "zdRcLtPlnBTs55KWg9KJqbBHKadYlY"
                },
            }).then((response)=>{
                let data = response.data;
                if (data && data.content) {
                    var content = data.content;
                    for (var i = 0; i < content.length; i++) {
                        this.AutoCompleteDataSource.push(content[i].title);
                    }
                }
            }).catch((err)=>{

            })
        },
        beforeRouteEnter (to, from, next) {
            //回调函数，当组件加载完毕后调用
            next(vm => {
                //如果进来时已经有了被选中的节点，那么直接路由到该节点
                if(vm.selectedItem.length>0){
                    vm.selectPageById(vm.selectedItem[0].treeId);
                }
            })
        }
    }
</script>