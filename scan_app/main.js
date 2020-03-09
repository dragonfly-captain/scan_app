import Vue from 'vue'
import App from './App'

import boboMessage from './components/bobo-message.vue'

// 使用自定义消息提示
Vue.component('message', boboMessage)
Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
