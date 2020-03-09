<template>
	<view class="content">
		<view class="fit"></view>
		
		<view class="nav_bg">
			<view class="dengchu" @click="goout">退出</view>
			<view class="name_row">
				<view class="name">{{adminName}} 你好！</view>
				<view class="img"><img mode="aspectFill" :src="adminIcon"></view>
			</view>
			<view class="nav_box">
				<view class="nav_main">
					<view class="step com_step"></view>
					<view class="step_article"></view>
					<view :class="[{'com_step':step2},'step']"  ></view>
					<view class="step_article"></view>
					<view  :class="[{'com_step':step3},'step']"></view>
				</view>
			</view>
		</view>
		<view class="gap"></view>
		<!-- 掃描時的頁面 -->

		<view v-if="isScan" class="san_main">
			<img mode="aspectFill" class="san_img" :src="adminScan" alt="">

			<button class="scan_but san_margin" v-show="scaning" @click="startScan">點擊掃描</button>
		</view>
		<!-- 確認發放時的頁面 -->
		<view class="get_info" v-if="affirmSuc">
			<view><text class="text_bar">領取人：</text><text class="text_info">{{geterName}}</text></view>
			<view><text class="text_bar">身份ID：</text><text class="text_info">{{bodyId}}</text></view>
			<view><text class="text_bar">領取時間：</text><text class="text_info">{{geterTime}}</text></view>
			
			<view class="station"><text class="text_bar site">領取站點：</text><xfl
				:list="list"
				:clearable="false"
				:style_Container="'height: 50px; font-size: 16px;'"
				:placeholder = "'placeholder'"
				:initValue="geterDistribute"
				:selectHideType="'hideAll'"
				class="site1"
			></xfl></view>
			<!-- <view><text class="text_bar">領取站點：</text><text class="text_info" @click="sheet">{{geterDistribute}}</text></view> -->
			<view><text class="text_bar">領取編號：</text><text class="text_info">{{qrCode}}</text></view>
		</view>
		<view >
			<button v-if="affirmSuc" class="scan_but" @click="affirm">確認發放</button>
			<button v-if="affirmSuc" class="scan_but affirm_back" @click="toBack">返回</button>
		</view>
		<!-- 發放時的頁面 -->
		<view v-if="isBack">發放成功！</view>
		<view>
			<button class="scan_but" @click="toBack" v-if="isBack">返回</button>
		</view>
		<view>
			<message ref="Message"></message>
		</view>
	</view>
</template>

<script>
	import {httpService} from "../../api/api";
	import xfl from "../../components/xfl-select/xfl-select";
	export default {
		data() {
			return {
				adminIcon:'static/header.png',
				adminScan:'static/sanImg.png',
				adminName:"",
				title: 'Hello',
				isScan:true,
				scaning:true,
				affirmSuc:false,
				isBack:false,
				step2:false,
				bodyId:'',
				step3:false,
				qrCode:'',
				geterName:'',
				geterTime:'',
				geterDistribute:'',
				isGeter:0,
				isMaturityTime:0,
				servId:'',
				list: [],
				idList: [],
				geterDistriId:''
			}
		},
		components:{
			'xfl':xfl
		},
		onLoad() {
			uni.getStorage({
				key: 'token',
				success: function(res) {
				},
				fail:function(){
					console.log("暫無token")
					uni.redirectTo({
						url: '../login/login'
					})
					return;
				}
			});
			uni.getStorage({
				key: 'serviceCenterId',
				success: function(res) {
					this.serviceCenterId = res.data
				}
			});
			
			this.initInfo()
		},
		methods: {
			startScan(){
				let that = this;
				uni.scanCode({
					success: function (res) {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						that.qrCode = res.result;
						// that.qrCode = '22oqvw';
						httpService("receive/getOrder?qrCode="+that.qrCode
						,null,"POST")
							.then((res) => {
								if(res[1].data.code == 200){
									if(!res[1].data.data.list){
										that.$refs['Message'].warn('此二維碼不可用');
										that.scaning = true;
										return;
									}
									let result = res[1].data.data.list[0];
									that.geterName = result.memberUsername,
									that.bodyId = result.identityNum,
									that.geterTime = result.subDate+" "+result.startTime+"-"+result.endTime,
									that.geterDistribute = result.distributeName,
									that.geterDistriId = result.distributeId,
									that.isGeter = result.isUse,
									that.isMaturityTime = result.isMaturityTime,
									that.isScan = false;
									that.affirmSuc = true;
									that.step2 = true;
									that.servId = result.serviceId;
									that.getDistributeInfo(result.orgId,result.serviceId);
								}else if(res[1].data.code == 401){
									that.goLogin();
								}else if(res[1].data.code == 500){
									that.$refs['Message'].warn('此二維碼不可用');
								}else{
									that.scaning = true;
									that.$refs['Message'].warn('網絡出錯，請重試');
								}
							})
							.catch((err) => {
								that.scaning = true;
								that.$refs['Message'].warn('網絡出錯，請重試');
							})
					},
					fail: function(err){
						that.scaning = true;
						that.$refs['Message'].warn('請重試');
					}
				});
			},
			affirm(){
				let that = this;
				if(this.serviceCenterId != this.servId && this.serviceCenterId != 200 ){
					that.$refs['Message'].warn('不是此選區兌換碼');
					return;
				}
				if(that.isGeter == 1){
					that.$refs['Message'].warn('此二維碼已領取');
					return
				}else if(that.isMaturityTime == 1){
					that.$refs['Message'].warn('此二維碼已過期');
					return
				}
				this.list.forEach((v,i) => {
					this.list.push(v.distributeName)
					this.idList.push(v.distributeId)
					if(v = this.distributeName){
						this.geterDistriId = this.idList[i]
					}
				})
				let data = {
					"qrCode": that.qrCode,
					"receiveDistributeId":that.geterDistriId
				}
				httpService("scanCodeForProduct",data,"POST")
					.then((res) => {
						if(res[1].data.code == 200){
							that.isBack = true;
							that.affirmSuc = false;
							that.step3 = true;
						}else if(res[1].data.code == 401){
							that.goLogin();
						}
						else{
							that.$refs['Message'].warn('網絡出錯，請重試');
						}
					})
					.catch((err) => {
						console.log(err,"affirm2")
						that.$refs['Message'].warn('網絡出錯，請重試');
					})
			},
			initInfo(){
				let that = this;
				httpService("info",null,"GET")
					.then((res) => {
						if(res[1].data.code == 200){
							if(res[1].data.data.icon){
								this.adminIcon = res[1].data.data.icon;
							}
							this.adminName = res[1].data.data.name;
							this.serviceCenterId = res[1].data.data.serviceCenterId;
							uni.setStorage({
								key: 'serviceCenterId',
								data: res[1].data.data.serviceCenterId,
								success: function(res) {
									console.log("token存儲成功")
								}
							});
						}else if(res[1].data.code == 401){
							that.goLogin();
						}
						else{
							this.initInfo();
						}
					})
					.catch((err) => {
						console.log(err,"info2")
						this.initInfo();
					})
			},
			getDistributeInfo(orgId,serviceId){
				let that = this;
				let data = {
					orgId,
					serviceId
				}
				httpService("distributeInfo",data,"POST")
					.then((res) => {
						if(res[1].data.code == 200){
							// this.list = res[1].data.data.list;distributeName
							res[1].data.data.list.forEach((v,i) => {
								this.list.push(v.distributeName)
								this.idList.push(v.distributeId)
							})
							
						}else if(res[1].data.code == 401){
							that.goLogin();
						}
						else{
							that.$refs['Message'].warn('網絡出錯，請重試');
						}
					})
					.catch((err) => {
						console.log(err,"affirm2")
						that.$refs['Message'].warn('網絡出錯，請重試');
					})
			},
			goLogin(){
				this.$refs['Message'].warn('登陸已過期，請重新登陸');
				uni.removeStorage({ key: 'token' });
				setTimeout(() => {
					uni.redirectTo({
						url: '../login/login'
					})
				},1000)
			},
			goout(){
				uni.removeStorage({ key: 'token' });
				setTimeout(() => {
					uni.redirectTo({
						url: '../login/login'
					})
				},1000)
			},
			toBack(){
				this.isBack = false;
				this.isScan = true;
				this.step2 = false;
				this.step3 = false;
				this.scaning = true;
				this.affirmSuc = false;
				this.isGeter = 0;
				this.isMaturityTime = 0;
			}
		}
	}
</script>

<style lang="less" scoped>
	@v: 3.75vw;
	.nav_bg{
		width: 100%;
		height: 200/@v;
		background: #FFDA45;
		position: relative;
		.name_row{
			height: 92/@v;
			text-align: left;
			padding-left:15/@v; 
			position: relative;
			top: 40/@v;
			.name{
				color:#000;
				font-weight: 600;
				font-size: 18/@v;
				line-height: 92/@v;
				margin-top: 17/@v;
			}
			.img{
				position: absolute;
				width: 92/@v;
				height: 92/@v;
				border:1/@v solid rgba(69,73,91,1);
				border-radius:50%;
				right: 15/@v;
				top:5/@v;
				background: #fff;
				overflow: hidden;
			}
			img{
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
		.nav_box{
			width: 340/@v;
			height: 70/@v;
			border-radius: 15/@v;
			background: #fff;
			position: absolute;
			top: 170/@v;
			left: 17/@v;
			box-shadow: #ccc 0px 1px 1px;
			display: flex;
			justify-content: center;
		}
		.nav_main{
			display: flex;
			margin-top: 30/@v;
			.step{
				border: 1px solid #a8a8a8;
				width: 10/@v;
				height: 10/@v;
				border-radius: 50%;
			}
			.step_article{
				width: 120/@v;
				height: 1/@v;
				background: #a8a8a8;
				margin-top: 5/@v;
				// margin: 5/@v;
			}
			.com_step{
				background: #91ff9a;
			}
		}
	}
	.station{
		display: flex;
		.site{
			flex:3;
			line-height: 45/@v;
		}
		.site1{
			flex:7;
		}
	}
	.dengchu{
		position: absolute;
		// top: 22/7.5vh;
		top: 32.5/@v;
		right: 15/@v;
		font-size: 16/@v;
	}
	.gap{
		height: 80/@v;
	}
	.san_main{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		.san_img{
			width: 166/@v;
			height:166/@v;
		}
	}
	.scan_but{
		width: 200/@v;
		height: 50/@v;
		border-radius: 30/@v;
		border: 0;
		background: #FFDA45;
		line-height: 50/@v;
		outline:none;
		margin-top: 60/@v;
	}
	.affirm_back{
		margin: 30/@v 0;
		background: #fff;
		border: 1px solid #ccc;
	}
	.san_margin{
		margin-top: 85/@v;
	}
	.get_info{
		font-size: 17/@v;
		line-height: 30/@v;
		.text_bar{
			float: left;
			width:92/@v;
			text-align-last: justify;
		}
		.text_info{
			display: inline-block;
			// float: left;
			width: 200/@v;
			max-height: 30/@v;
		}
	}
	.fit{
		background: #FFDA45;
	}
</style>
