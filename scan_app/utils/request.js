export const urlRequest = (url, param, way) => new Promise((resolve, reject) =>{
    let headerBase = {
        'Accept': 'application/json',
        'Content-Type': 'application/json', //自定义请求头信息
    }
    uni.getStorage({
        key: 'token',
        success: function(res) {
            headerBase.Authorization = res.data
        },
        fail:function(){
            console.log("暫無token")
            headerBase = {
                'Accept': 'application/json',
                'Content-Type': 'application/json', //自定义请求头信息
            }
        }
    });
    

    uni.request({
        url: url, //仅为示例，并非真实接口地址。
        data: param,
        header: headerBase,
        method: way

    })
    .then(res=> resolve(res))
    .catch(err => {
        // vue.newToast("获取数据失败,请重新打开")
        reject(err)
    });
})