import { createApp } from 'vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import './style.css';

const vuetify = createVuetify({
	components,
	directives,
	icons: {
		iconfont: 'mdi',
	},
	theme: {
		defaultTheme: 'customDark',
		themes: {
			customDark: {
				dark: true,
				colors: {
					background: '#101010',
					surface: '#121212',
					primary: '#ff0000',
					secondary: '#ff4d4d',
					accent: '#ff4d4d',
					error: '#ff0000',
					info: '#ffffff',
					success: '#00ff00',
					warning: '#ffff00',
				},
			},
		},
	},
});

const app = createApp(App);
app.use(VueCookies);
app.use(vuetify);
app.mount('#app');