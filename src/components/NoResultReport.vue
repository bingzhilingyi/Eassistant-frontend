<style scoped>
.searchBar{
    padding:20px 100px;
}	
.searchItem{
    margin-right: 30px;
}
.searchItem span{
    padding:0 20px;
}
.searchBtn{
    float: right;
}
</style>

<template>
    <div>
        <div class="searchBar">
            <span class="searchItem">
                <span>起始日期</span>
                <DatePicker type="date" placeholder="起始日期" style="width: 200px" size=large v-model="from"></DatePicker>
            </span>
            <span class="searchItem">
                <span>截止日期</span>
                <DatePicker type="date" placeholder="截止日期" style="width: 200px" size=large v-model="to"></DatePicker>
            </span>
            <Button icon="ios-search" @click="searchRecord" type="primary" size=large class="searchBtn">查询</Button>
        </div>
        <Table :columns="recordColumn" :data="recordData" :loading="isLoading" stripe border></Table>
        <div style="float: right;">
            <Page :total="totalElements" :current="currentPage" :page-size="pageSize" @on-change="changePage" show-total show-elevator size="small"></Page>
        </div>
    </div>
</template>

<script>
import servicePaths from '../router/path'
import store from '../store/NoResultReport-store'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
export default {
    store,
	data(){
		return {
            ...servicePaths(),
            from:'',
            to:'',
            recordColumn : [
                    {
                        title: 'ID',
                        key: 'recordId'
                    },
                    {
                        title: '查询记录',
                        key: 'recordTitle'
                    },
                    {
                        title: '查询时间',
                        key: 'creationDateStr'
                    },
                ],
            recordData:[]
		}
	},
	computed: {
        //vuex state map
        ...mapState([
            'historyValue', //上一次查询条件
            'totalElements', //总条目数
            'currentPage', //当前页
            'pageSize', //每页大小
            'isLoading',  //是否正在查询
            'rowIndex', //正在操作的表格行数
            'placeholder' //输入框提示
        ]),
        //vuex getter map
        ...mapGetters([
        ]),
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
        searchRecord(){
            //表格设置为加载中
            this.setLoading(true);
            this.$axios({
                url:`${this.userServicePath}/noresult/findByCreationDateBetween`,
                method:'get',
                params:{
                    page:this.currentPage-1, //实际页从0开始，所以要-1
                    size:this.pageSize, //每页大小
                    from:this.getDateString(this.from),
                    to:this.getDateString(this.to),
                    token:this.token
                }
            }).then((response)=>{
                var data = response.data;
                //返回success，登录成功
                if(data.status==='success'){
                    //接收数据
                    this.recordData = data.content;
                    //更新总条目
                    this.setTotalElements(data.totalElements)
                }else{
                    this.$Notice.error({
                        title: '查询失败',
                        desc: data.message
                    });
                }
                //表格设置为未加载
                this.setLoading(false);
            }).catch((err)=>{
                this.$Notice.error({
                    title: '查询出现异常',
                    desc: ''
                });
                //表格设置为未加载
                this.setLoading(false);
            })
        },
        //翻页方法
        changePage(p){
            this.setCurrentPage(p);
            this.searchRecord();
        },
        getDateString(date){
            if(!date){
                return '';
            }
            let year = date.getFullYear();
            let month = date.getMonth()+1;
            let day = date.getDate();
            if(month<10){
                month = "0"+month;
            }
            if(day<10){
                day = "0"+day;
            }
            let str = `${year}-${month}-${day}`;
            return str;
        }
	}
}
</script>
