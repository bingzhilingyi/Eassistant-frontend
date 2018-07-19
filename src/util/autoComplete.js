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
            let ignoreWord = [""];
            if (!value) {
                return;
            } else {
                value = value.trim().split(/\s+/g);
            };
            this.AutoCompleteData = [];
            //let reg = //i;
            //遍历数据源，如果存在要搜索的字符串，就加入data里
            for (let i = 0; i < this.AutoCompleteDataSource.length; i++) {
                let pass = true;
                for (let j = 0; j < value.length; j++) {
                    let reg = eval("/" + value[j] + "+/i");
                    if (!reg.test(this.AutoCompleteDataSource[i])) {
                        pass = false;
                        break;
                    }
                }
                if (pass) {
                    this.AutoCompleteData.push(this.AutoCompleteDataSource[i]);
                }
            }
        }
    }
}

export default autocomplete