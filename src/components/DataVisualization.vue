<style scoped>
.wrapper{
	width: 600px;
	height: 400px;
}
</style>
<template>
    <div id="app">
        <Layout :style="{minHeight:'460px',height:'inherit'}">
            <Sider :style="{backgroundColor:'#fff',marginRight:'5px'}">

            </Sider>
            <Content :style="{overflow:'auto',padding: '1px', background: '#fff'}">
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
            
        }
    },
    computed:{
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
                d.push(this.chartData.rows[i].historyContent);
            }
            return d;
        }
    },
    methods:{
        findTopRank(){
            this.$axios({
                url: `${this.userServicePath}/history/findTopRank`,
                params: {
                    rank: 10,
                    token: this.token
                },
            }).then((response)=>{
                let data = response.data;
                if(data&&data.status=='success'){
                    console.log(data.content);
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
