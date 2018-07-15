import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        historyValue: '', //上一次查询条件
        totalElements: 0, //总条目数
        currentPage: 1, //当前页
        pageSize: 10, //每页大小
        isLoading: false, //是否正在查询
        showDeleteWarn: false, //是否显示删除提醒模态框
        rowIndex: 0, //当前正在操作的表格的行数
        placeholder: '请输入账号或姓名进行查询...', //输入框的提示
        searchType: 'account', //根据什么条件进行搜索
    },
    getters: {},
    mutations: {
        setLoading(state, isLoading) {
            state.isLoading = isLoading
        },
        setHistoryValue(state, historyValue) {
            state.historyValue = historyValue
        },
        setTotalElements(state, totalElements) {
            state.totalElements = totalElements
        },
        setCurrentPage(state, currentPage) {
            state.currentPage = currentPage
        },
        setPageSize(state, pageSize) {
            state.pageSize = pageSize
        },
        setShowDeleteWarn(state, showDeleteWarn) {
            state.showDeleteWarn = showDeleteWarn
        },
        setRowIndex(state, rowIndex) {
            state.rowIndex = rowIndex
        },
        setPlaceHolder(state, placeholder) {
            state.placeholder = placeholder
        },
        setSearchType(state, searchType) {
            state.searchType = searchType;
            if (searchType == 'account') {
                state.placeholder = '请输入账号或姓名进行查询...';
            } else if (searchType == 'group') {
                state.placeholder = '请输入角色名进行查询...';
            }
        },
    },
    actions: {},
    strict: process.env.NODE_ENV !== 'production' //严格模式影响性能，所以生产模式下不能开放
})

export default store;