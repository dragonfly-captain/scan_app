<template>
	<view class="content">
		<view class="fit"></view>
		<view class="box">
			<view class="content imgs" v-if="isload">
				<view class="img_wid">
					<!-- <img mode="aspectFill" src="../../static/loading.gif" alt=""> -->
				</view>
				<text>正在驗證你的電話號碼</text>
			</view>
			<view class="content imgs" v-else>
				<view class="img_aff">
					<!-- <img mode="aspectFill" src="../../static/sccessImg.png" alt=""> -->
				</view>
				<text>驗證碼已發送到你的電話號碼</text>
			</view>
		</view>
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
				isload:true,
				phone:""
			};
		},
		methods:{

		},
		onShow: function() {
			let that = this;
			httpService("getAuthCode",{telephone:this.phone},"GET")
					.then((res) => {
						if(res[1].data.code == 500){
							if(res[1].data.message == '手机号无权限'){
								that.$refs['Message'].warn('此手機號暫無權限')
							}else{
								that.$refs['Message'].warn('操作頻繁，請稍後再試')
							}
							setTimeout(() => {
								uni.$emit("loginCode",1)
								uni.navigateBack()
							},1000)
						}else{
							this.isload = false;
							setTimeout(() => {
								uni.$emit("loginCode",2)
								uni.navigateBack()
							},1000)
						}
					})
					.catch((err) => {
						this.isload = false;
						that.$refs['Message'].warn('網絡出錯，請重試')
						setTimeout(() => {
							uni.$emit("loginCode",1)
							uni.navigateBack()
						},1000)
					})
			
		},
		onLoad: function (option) { //option为object类型，会序列化上个页面传递的参数
			this.phone = option.phone;
		}
	}
</script>

<style lang="less" scoped>
	@v: 3.75vw;
	.box{
		margin-top: 100/@v;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #2c3e50;
		font-size: 16/@v;
		img{
			margin-block: 20/@v;
		}
	}
	.imgs{
		.img_wid{
			width: 80/@v;
			height:80/@v;
			margin: 60/@v 0 20/@v 0;
			background-image:url(../../static/bars.svg);
			background-size:cover;
			// img{
			// 	width: 80/@v;
			// 	height:80/@v;
			// }
		}
		.img_aff{
			width: 80/@v;
			height:80/@v;
			margin: 60/@v 0 20/@v 0;
			background-image:url(../../static/sccessImg.png);
			background-size:cover;
		}
	}
</style>
