<template>
	<view class="content">
		<div class="backup" v-if="routerNum == 2" @click="iback">上一步</div>
		<view class="fit"></view>
		<view class="info_box" v-if="routerNum == 1">
			<text class="titel">請輸入你的電話號碼</text>
			<!-- <input v-model="phone" @blur="numChange" class="numder_inp" type="number"> -->
			<input v-model="phone" class="numder_inp" type="number">
			<!-- <view v-if="phoneTset" class="hint">*請輸入正確的手機號碼</view> -->
		</view>
		<view class="info_box edit_hint" v-else>
			<text class="titel">請輸入密碼</text>
			<input v-model="passNum" class="numder_inp" type="password">
			<text class="titel">請輸入驗證碼</text>
			<input v-model="hintNum" class="numder_inp" type="number">
		</view>
		<button class="scan_but" @click="submit">確定</button>

		<view>
			<message ref="Message"></message>
		</view>
	</view>
</template>

<script>
	import {httpService} from "../../api/api";
	export default {
		data() {
			return {
				phone:'',
				phoneTset:false,
				editPhone:true,
				hintNum:'',
				passNum:'',
				routerNum:1
			};
		},
		methods:{
			submit(){
				let that =this;
				if (!this.phone) {
					that.$refs['Message'].warn('請填寫手機號');
					return
				}
				if(this.routerNum == 1){
					uni.navigateTo({
						url: 'verification?phone='+this.phone
					});
					
				}else{
					if(!this.passNum){
						that.$refs['Message'].warn('請填寫密碼')
						return
					}else if(!this.hintNum){
						that.$refs['Message'].warn('請填寫驗證碼')
						return
					}
					that.$refs['Message'].info('正在登錄')
					let data = {
						username:this.phone,
						authCode:this.hintNum,
						password:this.passNum
					}
					httpService("admin/loginByPassword?username="+this.phone+"&authCode="+this.hintNum+"&password="+encodeURIComponent(this.passNum)
					,null,"POST")
					.then((res) => {
						console.log(res,"請求參數返回值")
						if(res[1].data.code == 401){
							that.$refs['Message'].warn('token過期');
						}else if(res[1].data.code == 400){
							that.$refs['Message'].warn('驗證碼錯誤');
						}else if(res[1].data.code == 200){
							that.$refs['Message'].success('登錄成功')
							console.log(res[1].data.data.token,"TOKEN")
							let token = res[1].data.data.tokenHead + res[1].data.data.token;
							uni.setStorage({
								key: 'token',
								data: token,
								success: function(res) {
									console.log("token存儲成功")
								}
							});
							uni.redirectTo({
								url: '../index/index'
							});
							setTimeout(() => {
								this.routerNum = 1;
							})
						}else{
							that.$refs['Message'].warn('網絡出錯，請重試')
						}
						
					})
					.catch((err) => {
						console.log(err)
						that.$refs['Message'].warn('網絡出錯，請重試')
					})
				}
			},
			iback(){
				this.routerNum = 1;
			}
			// numChange(){
			// 	if(!(/^1[3456789]\d{9}$/.test(this.phone))){ 
			// 		this.phoneTset = true; 
			// 	}else{
			// 		this.phoneTset = false; 
			// 	} 
			// },

		},
		onLoad(){
			uni.$on("loginCode",(val =>{
				this.routerNum = val;
			}))
		}
	}
</script>

<style lang="less" scoped>
	@v: 3.75vw;
	.info_box{
		margin-top:100/@v; 
		height: 90/@v;
		.titel{
			color: #2c3e50;
			font-size: 16/@v;
		}
		.numder_inp{
			width: 240/@v;
			height: 40/@v;
			border: 1px solid #ccc;
			border-radius: 25/@v;
			padding-left: 15/@v;
			margin: 20/@v 0 10/@v;
		}
		.hint{
			color: red;
			font-size:14/@v;
		}
	}
	.scan_but{
		width: 255/@v;
		height: 45/@v;
		border-radius: 30/@v;
		border: 0;
		background: #f1c40e;
		line-height: 45/@v;
		outline:none;
		margin-top: 60/@v;
	}
	.backup{
		margin: 35/@v 0 0 10/@v;
		text-align: left;
		align-self: flex-start;
		color: #2c3e50;
		font-size: 16/@v;
	}
	.edit_hint{
		height: 180/@v;
		font-size: 12/@v;
	}
</style>
