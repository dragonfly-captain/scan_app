<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="less">
	/*每个页面公共css */
	@v: 3.75vw;
	li {
		list-style-type:none;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	/*適配劉海屏 */
	.fit{
		height: var(--status-bar-height);
		width: 100%;
	}
</style>
