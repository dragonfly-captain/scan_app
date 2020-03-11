import { urlRequest } from "../utils/request";
// let baseUrl =  "https://testkylx01.datailinc.com/"
let baseUrl =  "https://pro1.maskforhk.online/"
// let baseUrl =  "https://192.168.7.11:11001/"
let ajaxUrl = {
    getAuthCode:baseUrl + "admin/getAuthCode",//獲取驗證碼
    loginByPassword:baseUrl + "admin/loginByPassword",//登錄
    info:baseUrl + "admin/info",//個人信息
    scanCodeForProduct:baseUrl + "receive/scanCodeForProduct",//掃碼領取
    getOrder:baseUrl + "receive/getOrder",//訂單領取，確認發放
    distributeInfo:baseUrl + "distributeInfo/selectDistributeInfoByServicId",//派發站點
}
export const httpService = (url, params,way)  => new Promise((resolve, reject) =>{
    let requrl = ajaxUrl[url]?ajaxUrl[url]:baseUrl +url
        urlRequest(requrl, params,way)
        .then(res=> resolve(res))
        .catch(err => {
            // vue.newToast("获取数据失败,请重新打开")
            reject(err)
        });
    
})
// export const commonGet = (url, params)  =>{
//     let requrl = ajaxUrl[url]?ajaxUrl[url]:url
//     getHttpService(requrl,params)
// }
