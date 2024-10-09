const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
	transpileDependencies: true,
	publicPath: '/speech/',

	devServer: {
		client: {
			overlay: {
				runtimeErrors: (error) => {
					const ignoreErrors = [
						"ResizeObserver loop limit exceeded",
						"ResizeObserver loop completed with undelivered notifications.",
					];
					if (ignoreErrors.includes(error.message)) {
						return false;
					}
					return true;
				},
			},
		},
	},
});
