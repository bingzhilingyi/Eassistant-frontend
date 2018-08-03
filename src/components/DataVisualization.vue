<style scoped>
.wrapper{
	width: 600px;
	height: 400px;
}
.hide{
    display: none;
}
</style>
<template>
    <div id="app">
        <Layout :style="{minHeight:'460px',height:'inherit'}">
            <Sider :style="{backgroundColor:'#fff',marginRight:'5px',paddingRight:'10px'}">
                <Form :model="formItem" :label-width="50">
                    <FormItem label="类型" >
                        <Select v-model="formItem.type" @on-change="changeType">
                            <Option value="topPage">热度最高知识页</Option>
                            <Option value="topHistory">热度最高查询历史</Option>
                            <Option value="historyCount">每日查询量</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="数量" v-bind:class="{ hide: !notHistoryCount}">
                        <Select v-model="formItem.size">
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="30">30</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="域" v-bind:class="{ hide: notTopPage}">
                        <CheckboxGroup v-model="formItem.domain">
                            <Checkbox label="SRM">SRM</Checkbox>
                            <Checkbox label="PAY">支付</Checkbox>
                            <Checkbox label="WZ">物资</Checkbox>
                            <Checkbox label="XM">项目</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="起始日" v-bind:class="{ hide: notHistoryCount}">
                        <DatePicker type="date" placeholder="请选择起始日期" v-model="formItem.from"></DatePicker>
                    </FormItem>
                    <FormItem label="结束日" v-bind:class="{ hide: notHistoryCount}">
                        <DatePicker type="date" placeholder="请选择结束日期" v-model="formItem.to"></DatePicker>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" @click="search">查询</Button>
                    </FormItem>
                </Form>
            </Sider>
            <Content :style="{overflow:'auto',padding: '10px', background: '#fff'}">
                <template v-if="formItem.type==='historyCount'">
                    <ve-line :data="chartData" :settings="chartSettings" :width="histogramWidth" :xAxis="xAxis"></ve-line>
                </template>
                <template v-else>
                    <ve-histogram :data="chartData" :settings="chartSettings" :width="histogramWidth" :xAxis="xAxis"></ve-histogram>
                </template>
            </Content>
        </Layout>
    </div>
</template>
<script>
import Schart from 'vue-schart';
import servicePaths from '../router/path';
export default {
    data() {
        return {
            ...servicePaths(), //服务地址
            chartData: {
                columns: ['title', 'rank'],
                rows: []
            },
            chartSettings:{
                metrics: ['rank'],
                dimension: ['title'],
                labelMap: {
                    'rank': '查询次数'
                },
            },
            histogramWidth:'600px',
            formItem:{
                type: 'topPage',
                size: '10',
                domain:['SRM']
            }
        }
    },
    computed:{
        conf(){
            return {
                topPage :{url:`${this.userServicePath}/client/findTopRank`,column:'title'},
                topHistory: {url:`${this.userServicePath}/history/findTopRank`,column:'historyContent'},
                historyCount:{url:`${this.userServicePath}/history/findCount`,column:'countDate'},
            }
        },
        xAxis(){
            return {
                axisLabel:{
                    interval: 0,
                    rotate:-30
                },
                data:this.xAxisData
            }
        },   
        xAxisData(){
            let d = [];
            for(let i=0;i<this.chartData.rows.length;i++){
                d.push(
                    this.chartData.rows[i][
                        this.conf[this.formItem.type].column
                    ]
                );
            }
            return d;
        },
        notTopPage(){
            return this.formItem.type !== 'topPage';
        },
        notHistoryCount(){
            return this.formItem.type !== 'historyCount';
        }
    },
    methods:{
        changeType(){
            if(this.formItem.type === 'topPage'){
                this.chartData = {
                    columns: ['title', 'rank'],
                    rows: []
                };
                this.chartSettings = {
                    metrics: ['rank'],
                    dimension: ['title'],
                    labelMap: {
                        'rank': '查询次数'
                    },
                }
            }else if(this.formItem.type === 'topHistory'){
                this.chartData = {
                    columns: ['historyContent', 'rank'],
                    rows: []
                }
                this.chartSettings = {
                    metrics: ['rank'],
                    dimension: ['historyContent'],
                    labelMap: {
                        'rank': '查询次数'
                    },
                }
            }else if(this.formItem.type === 'historyCount'){
                this.chartData = {
                    columns: ['countDate', 'countNumber'],
                    rows: []
                }
                this.chartSettings = {
                    metrics: ['countNumber'],
                    dimension: ['countDate'],
                    labelMap: {
                        'countNumber': '查询次数'
                    },
                }
            };
            this.search();
        },
        search(){
            this.$axios({
                url: this.conf[this.formItem.type].url,
                params: {
                    size: this.formItem.size,
                    token: this.token,
                    domain: this.formItem.domain.toString(),
                    from: this.getDateString(this.formItem.from),
                    to: this.getDateString(this.formItem.to)
                },
            }).then((response)=>{
                let data = response.data;
                if(data&&data.status=='success'){
                    this.chartData.rows = data.content;
                }else{
                    this.$Notice.error({
                        title: '查询数据失败',
                        desc: data.message
                    });
                }
            }).catch((err)=>{
                this.$Notice.error({title: '查询出现异常'});
            })
        },
        getDateString(date){
            if(!date){
                date = new Date();
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
    },
    props:['token'],
    created(){
        this.search();
    }
}
</script>
