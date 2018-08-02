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
                        <Select v-model="formItem.type" @on-change="findTopRank">
                            <Option value="topPage">热度最高知识页</Option>
                            <Option value="topHistory">热度最高查询历史</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="数量">
                        <Select v-model="formItem.size">
                            <Option value="10">10</Option>
                            <Option value="20">20</Option>
                            <Option value="30">30</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="域" v-bind:class="{ hide: isHide }">
                        <CheckboxGroup v-model="formItem.domain">
                            <Checkbox label="SRM">SRM</Checkbox>
                            <Checkbox label="PAY">支付</Checkbox>
                            <Checkbox label="WZ">物资</Checkbox>
                            <Checkbox label="XM">项目</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" @click="findTopRank">查询</Button>
                    </FormItem>
                </Form>
            </Sider>
            <Content :style="{overflow:'auto',padding: '10px', background: '#fff'}">
                <ve-histogram :data="chartData" :settings="chartSettings" :width="histogramWidth" :xAxis="xAxis"></ve-histogram>
            </Content>
        </Layout>
    </div>
</template>
<script>
import Schart from 'vue-schart';
import servicePaths from '../router/path';
export default {
    data() {
        this.chartSettings = {
            metrics: ['rank'],
            dimension: ['historyContent'],
            labelMap: {
                'rank': '查询次数'
            },
        }
        return {
            ...servicePaths(), //服务地址
            chartData: {
                columns: ['historyContent', 'rank'],
                rows: []
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
            return{
                topPage :{url:`${this.userServicePath}/client/findTopRank`,column:'title'},
                topHistory: {url:`${this.userServicePath}/history/findTopRank`,column:'historyContent'}
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
                d.push(this.chartData.rows[i][this.conf[this.formItem.type].column]);
            }
            return d;
        },
        isHide(){
            return this.formItem.type === 'topHistory';
        }
    },
    methods:{
        findTopRank(){
            this.$axios({
                url: this.conf[this.formItem.type].url,
                params: {
                    size: this.formItem.size,
                    token: this.token,
                    domain: this.formItem.domain.toString()
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
        }
    },
    props:['token'],
    created(){
        this.findTopRank();
    }
}
</script>
