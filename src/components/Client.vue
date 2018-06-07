<style scoped>
</style>
<template>
    <div>
        <p style="text-align:center">
            <b style="color:#00C1DE">温馨提示</b>：该测试页面由vue编写，正式环境客户端页面由jquery编写，故最终显示效果及用户体验会有细微差别，但功能完全一致。
        </p>
        <div id="QaShowDiv" class="QaViewDiv">
            <div v-for="(item,index) in data" :class="item.class" :key="index">
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
            <button @click="search">查询</button>
        </div>
    </div>
</template>

<script>
    require('webpack-jquery-ui');
    require('webpack-jquery-ui/css');
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
                recommondData:[] //推荐数据
            }
        },
        watch:{
            //监控数据，如果发生变化就自动滚动到最底下
            data:function(val,oldval){  
                this.scrollTop();  
            }  
        },
        methods:{
            ...autocomplete.methods,
            scrollTop() {
                //nextTick在dom元素更新之后立即调用
                this.$nextTick(function(){
                    $("#QaShowDiv").scrollTop($("#QaShowDiv")[0].scrollHeight);
                })
            },
            generateLeftPop(value) {
                this.data.push({
                    class:"leftpop",
                    value:value
                })
            },
            generateRightPop(value) {
                this.data.push({
                    class:"rightpop",
                    value:value
                })
            },
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
            clickSearch(value) {
                this.value = value;
                this.search();
            },
            search() {
                var value = this.value;
                if (!value) return;
                this.generateRightPop({data:value,list:[]});

                this.$axios({
                    url: `${this.userServicePath}/client/findByTitle`,
                    params: {
                        title: value,
                        token: "zdRcLtPlnBTs55KWg9KJqbBHKadYlY"
                    },
                    method:'get'
                }).then((Response)=>{
                    let data = Response.data;
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
                        this.generateLeftPop({data:"<p>抱歉，没有查询到与 <b>" + value + "</b> 有关的结果</p>",list:[]});
                    }
                }).catch((err)=>{
                    this.generateLeftPop({data:"抱歉，查询出错了...",list:[]});
                })
            },
        },
        //只有第一次创建执行
        created(){
            this.$axios({
                url: `${this.userServicePath}/client/findTopRank`,
                params: {
                    size: 100,
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