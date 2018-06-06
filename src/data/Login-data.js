const baseData = {
    baseInputData: {
        size: 'large',
        clearable: true
    },
    baseIconData: {
        slot: 'prepend',
        size: 22
    }
};
//校验规则
const ruleLogin = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { type: 'string', min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ]
};


const data = {
    ruleLogin,
    usernameInputData: {
        ...baseData.baseInputData,
        placeholder: ' 用户名',
        type: 'text'
    },
    passwordInputData: {
        ...baseData.baseInputData,
        placeholder: ' 密 码',
        type: 'password'
    },
    usernameIconData: {
        ...baseData.baseIconData,
        type: "ios-person-outline"
    },
    passwordIconData: {
        ...baseData.baseIconData,
        type: "ios-locked-outline"
    },
    loginBtnData: {
        long: true,
        type: 'primary',
        size: 'large',
    }
}

export default data;