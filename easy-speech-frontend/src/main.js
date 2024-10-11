import { createApp } from 'vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import './style.css';
import LocalDatabaseService from './services/LocalDatabaseService.js';

const savedDarkTheme = LocalDatabaseService.load('darkTheme');
let isDark = false;

if (savedDarkTheme !== null && savedDarkTheme !== undefined) {
	isDark = savedDarkTheme;
} else {
	isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	LocalDatabaseService.save('darkTheme', isDark);
}

const vuetify = createVuetify({
	components,
	directives,
	icons: {
		iconfont: 'mdi',
	},
	theme: {
		defaultTheme: isDark ? 'customDark' : 'customLight',
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
			customLight: {
				dark: false,
				colors: {
					background: '#ffffff',
					surface: '#f5f5f5',
					primary: '#6200ea',
					secondary: '#03dac6',
					accent: '#03dac6',
					error: '#b00020',
					info: '#000000',
					success: '#00c853',
					warning: '#ffab00',
				},
			},
		},
	},
});

const app = createApp(App);
app.use(VueCookies);
app.use(vuetify);
app.mount('#app');