<style scoped>
.wrapper{
	width: 500px;
	height: 400px;
}
</style>
<template>
    <div id="app">
        <schart class="wrapper"
            :canvasId="canvasId"
            :type="type"
            :data="data"
            :options="options"
        ></schart>
    </div>
</template>
<script>
import Schart from 'vue-schart';
export default {
    data() {
        return {
            canvasId: 'myCanvas',
            type: 'bar',
            data: [
                {name: '2014', value: 1342},
                {name: '2015', value: 2123},
                {name: '2016', value: 1654},
                {name: '2017', value: 1795},
            ],
            options: {
                title: 'Total sales of stores in recent years'
            }
        }
    },
    components:{
        Schart
    }
}
</script>
