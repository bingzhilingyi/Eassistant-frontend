const email = {
    //邮件数据
    data() {
        return {
            emailData: []
        }
    },
    methods: {
        //邮件地址自动补全
        handleEmailInput(value) {
            this.emailData = !value || value.indexOf('@') >= 0 ? [] : [
                value + '@qq.com',
                value + '@sina.com',
                value + '@163.com',
                value + '@126.com'
            ];
        }
    }
}

export default email