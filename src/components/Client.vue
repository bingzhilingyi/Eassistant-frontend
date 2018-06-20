<style scoped>
</style>
<template>
    <div>
        <p style="text-align:center">
            <b style="color:#00C1DE">温馨提示</b>：该测试页面由vue编写，正式环境客户端页面由jquery编写，故最终显示效果及用户体验会有细微差别，但功能完全一致。
        </p>
        <div class="qaSystem" id="qaSystem">
            <div class="qa_clear_btn" @click="qa_clear()">清空</div>
            <div id="QaShowDiv" class="QaViewDiv" ref="QaViewDiv">
                <div v-for="(item,index) in data" :class="item.class" :key="index" :ref="'leftPop-'+index">
                    <span v-html="item.value.data"></span>
                    <ul>
                        <li v-for="l in item.value.list" :key="l">
                            <a class="childrenItem" @click="clickSearch(l)">{{l}}</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="QaSearchDiv">
                <AutoComplete
                v-model="value"
                :data="AutoCompleteData"
                placeholder="您想查询什么..."
                @on-search="handleComplete"
                @keyup.enter="search"
                size="large"
                style="width:400px"></AutoComplete>
                <Button @click="search">查询</Button>
            </div>
        </div>
        <Modal v-model="showBigImage" width="800">
            <img :src.prop="imageSource"></img>
            <div slot="footer">
            </div>
        </Modal>
    </div>
</template>

<script>
    require('../styles/client.css');
    import Vue from 'vue';
    import autocomplete from '../util/autoComplete';
    import servicePaths from '../router/path';

    export default {
        data(){
            return {
                ...servicePaths(),
                value:"", //输入框数据
                ...autocomplete.data(),
                data:[], //对话框的数据
                recommondData:[], //推荐数据
                showBigImage:false,
                imageSource:'',
                isSearching:false
            }
        },
        watch:{
            //监控数据，如果发生变化就自动滚动到最底下，并给数据里的图片都加上点击放大效果
            data:function(val,oldval){
                this.$nextTick(()=>{
                    //为图片绑定点击放大效果
                    this.enlargeImage();
                    //超过一定高度折叠
                    this.foldResponse();
                    //滚动条滚到最下
                    this.scrollTop(); 
                })
            }  
        },
        computed:{
        },
        methods:{
            ...autocomplete.methods,
            //滚动条滚到最下面
            scrollTop() {
                //nextTick在dom元素更新之后立即调用
                this.$nextTick(()=>{
                    this.$refs.QaViewDiv.scrollTop = this.$refs.QaViewDiv.scrollHeight;
                })
            },
            //生成左边的对话框
            generateLeftPop(value) {
                this.data.push({
                    class:"leftpop",
                    value:value
                })
            },
            //生成右边对话框
            generateRightPop(value) {
                this.data.push({
                    class:"rightpop",
                    value:value
                })
            },
            //根据数据生成列表
            generatelist(data) {
                var value = this.value;
                var v = {
                    data:"",
                    list:[]
                }
                v.data = "<p>请问您想咨询什么有关<b> " + value + " </b>的问题？</p>";
                for (var i = 0; i < data.length; i++) {
                    v.list.push(data[i].title);
                }
                
                this.generateLeftPop(v);
            },
            //点击关键字进行查询的方法
            clickSearch(value) {
                this.value = value;
                this.search();
            },
            //查询的方法
            search() {
                var value = this.value;
                if (!value)
                    return
                else if (value === 'clear') {
                    this.data = [];
                    this.value = '';
                    //生成欢迎与推荐信息
                    this.generateLeftPop({
                        data:"欢迎使用自动应答系统,您也许想咨询以下信息:",
                        list:this.recommondData
                    });
                    return;
                } else if (this.isSearching) {
                    //如果当前正在查询中，不让再查
                    this.qa_generateLeftPop('正在查询中，请稍后...');
                    return;
                }
                this.generateRightPop({data:value,list:[]});
                //发送查询请求
                this.$axios({
                    url: `${this.userServicePath}/client/findByTitle`,
                    params: {
                        title: value,
                        token: "zdRcLtPlnBTs55KWg9KJqbBHKadYlY"
                    },
                    method:'get'
                }).then((Response)=>{
                    let data = Response.data; //返回的数据
                    let d = data.content; //返回的节点信息
                    //判断返回的节点信息title是否是你的查询值，是则说明返回的是精确查询结果
                    if (d && d.title == value) {
                        //有子集就显示子集列表
                        if (d.child && d.child.length > 0) {
                            this.generatelist(d.child);
                        } else {
                            //无子集，则显示节点详细
                            this.generateLeftPop({data:d.qaPage.htmlContent,list:[]});
                        }
                    } else if (d && d.child && d.child.length > 0) {
                        //如果返回结果是模糊查询且有值，返回模糊查询列表
                        this.generatelist(d.child);
                    } else {
                        //如果既不是精确查询，模糊查询也没有值，则返回无结果
                        this.generateLeftPop({data:"<p>抱歉，没有查询到与 <b>" + value + "</b> 有关的结果</p>",list:[]});
                    }
                }).catch((err)=>{
                    this.generateLeftPop({data:"抱歉，查询出错了...",list:[]});
                })
            },
            //图片点击放大效果
            enlargeImage(){
                var index = this.data.length-1;
                var vm = this;
                $(this.$refs[`leftPop-${index}`])
                .find("img")
                .click(function(){
                    vm.showBigImage = true;
                    vm.imageSource = $(this).attr("src");
                })
            },
            //折叠太长的答案
            foldResponse(){
                var index = this.data.length-1;
                var lastItem = $(this.$refs[`leftPop-${index}`]);
                if (parseInt(lastItem.css('height')) > 350) {
                    lastItem.css('height', '350px');
                    var expand = $("<div class='notice_bar'>显示全部</div>")
                        .click(function() {
                            if ($(this).html() == '显示全部') {
                                $(this).html('隐藏');
                                lastItem.css('height', 'auto')
                            } else {
                                $(this).html('显示全部');
                                lastItem.animate({
                                    'height': '350px'
                                }, 200);
                            }
                        });
                    lastItem.append(expand);
                }
            },
            //清除所有对话框
            qa_clear() {
                this.data = [];
                //生成欢迎与推荐信息
                this.generateLeftPop({
                    data:"欢迎使用自动应答系统,您也许想咨询以下信息:",
                    list:this.recommondData
                });
            }
        },
        //只有第一次创建执行，查询排名前100的知识页
        created(){
            this.$axios({
                url: `${this.userServicePath}/client/findTopRank`,
                params: {
                    size: 500,
                    token: "zdRcLtPlnBTs55KWg9KJqbBHKadYlY"
                },
                method:'get'
            }).then((Response)=>{
                let data = Response.data;
                if (data && data.content) {
                    var content = data.content;
                    for (var i = 0; i < content.length; i++) {
                        //把数据都推入自动提示数据源中
                        this.AutoCompleteDataSource.push(content[i].title);
                        //把前10条数据推入推荐数据源中
                        if(i<=9){
                            this.recommondData.push(content[i].title);
                        }
                    }
                    this.generateLeftPop({
                        data:"欢迎使用自动应答系统,您也许想咨询以下信息:",
                        list:this.recommondData
                    });
                }
            }).catch((err)=>{
            })
        },
        //每次路由进入都执行
        beforeRouteEnter (to, from, next) {
            //回调函数，当组件加载完毕后调用
            next(vm => {
                //滚动条到最下
                vm.scrollTop();  
            })
        },
    }
</script>