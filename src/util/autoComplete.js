const autocomplete = {
    //邮件数据
    data() {
        return {
            AutoCompleteDataSource: [], //自动补全数据源
            AutoCompleteData: [], //自动补全的当前数据
        }
    },
    methods: {
        //自动补全方法
        handleComplete(value) {
            this.AutoCompleteData = []
                //遍历数据源，如果存在要搜索的字符串，就加入data里
            for (let i = 0; i < this.AutoCompleteDataSource.length; i++) {
                if (value && this.AutoCompleteDataSource[i].toUpperCase().indexOf(value.toUpperCase()) !== -1) {
                    this.AutoCompleteData.push(this.AutoCompleteDataSource[i]);
                }
            }
        }
    }
}

export default autocomplete