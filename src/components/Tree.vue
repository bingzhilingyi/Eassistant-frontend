<style scoped>
.btnGroup{
    padding-bottom:10px;
    height:50px;
}
.searchedData li{
    list-style-type:none;
    padding:5px 30px;
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
                            <a @click="selectPage2(treeId)">{{title}}</a>
                        </li>
                    </ul>
                    <p>共查出<span style="color:red">{{searchedTotal}}</span>条数据,
                        显示前<span style="color:red">{{searchedDataLength}}</span>条
                        <a @click="hideSearch">[收起]</a>    
                    </p>
                </div>
                <div style="overflow:auto;padding-top:20px">
                    <Tree :data="treeData" :load-data="loadData" @on-select-change="selectPage" ref="tree"></Tree>
                </div>
            </Sider>
            <Content :style="{overflow:'auto',padding: '1px', background: '#fff'}">
                <router-view @updateTree="OnUpdateTree" @deleteNode="onDeleteNode"></router-view>
            </Content>
        </Layout>
    </div>  
</template>
<script>
    import my_ajax from '../util/ajax';
    import autocomplete from '../util/autoComplete';
    import servicePaths from '../router/path';
    import $ from 'jquery';
    export default {
        data () {
            return {
                ...servicePaths(),
                isHide:true,
                isLoading:false,
                title:'',
                ...autocomplete.data(),
                searchedData:[], //查询到的数据
                searchedTotal:0,
                message:'点我可以查询',
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
            ...autocomplete.methods,
            //加载下级节点的方法
            loadData (item, callback) {
                this.loadTree(item.treeId,callback);
            },
            //通过父id读取子节点
            loadTree (parentId,callback){
                var that = this;
                my_ajax({
                        url:`${this.userServicePath}/tree/getByParentId/${parentId}`,
                        data:{
                            token:this.token
                        },
                        success:function(data){
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
                                that.$Notice.error({
                                    title: '层级树查询失败',
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
                        }
                })
            },
            //点击选中页面的方法
            selectPage(item){
                this.selectedItem = item;
                //路由到页面详细信息
                if(item.length>0){
                    this.$router.push({name:'nodeview',params:{token:this.token,treeId:item[0].treeId}});
                }else{
                    this.$router.push({name:'tree',params:{token:this.token}});
                }
            },
            selectPage2(treeId){
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
            //跳转到查询节点页
            searchNode(){
                //如果按钮有字，说明还未出现查询框，则显示查询框并清楚按钮的文字
                if(this.message){
                    this.toggelSearch(true);
                }else{
                    this.isHide = false;
                    this.isLoading = true;
                    var that = this;
                    my_ajax({
                        url:`${this.userServicePath}/tree/getPagedByTitleLike`,
                        data:{
                            token:this.token,
                            title:this.title,
                            page:0, //默认只查前10个
                            size:10
                        },
                        success(data){
                            if(data&&data.status=='success'){
                                //接收数据
                                that.searchedData = data.content;
                                that.searchedTotal = data.totalElements;
                            }else{
                                that.$Notice.error({
                                    title: '查询失败',
                                    desc: data.message
                                });
                            }
                        },
                        error(e){
                            that.$Notice.error({
                                title: '查询出现异常'
                            });
                        },
                        complete(){
                            that.isLoading = false;
                        }
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
            var that = this;
            //查找排名最高的100个页面
            my_ajax({
                url: `${this.userServicePath}/client/findTopRank`,
                data: {
                    size: 100,
                    token: "zdRcLtPlnBTs55KWg9KJqbBHKadYlY"
                },
                success(data) {
                    if (data && data.content) {
                        var content = data.content;
                        for (var i = 0; i < content.length; i++) {
                            that.AutoCompleteDataSource.push(content[i].title);
                        }
                    }
                },
                error(e) {}
            })
        },
        beforeRouteEnter (to, from, next) {
            //回调函数，当组件加载完毕后调用
            next(vm => {
                // //如果当前树没有数据，则进行加载
                // if(vm.treeData.length==0){
                    
                // }
                // //如果自动提示没有数据，则加载自动提示数据
                // if(vm.AutoCompleteDataSource.length==0){
                    
                // }
            })
        }
    }
</script>