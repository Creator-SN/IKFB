// global @types helper Vscode
import Vue from "vue";
import store from "./src/store/";
import router from "./src/router/";

declare module "vue/types/vue" {
	interface Vue {
		$store: typeof store;
		$router: typeof router;
	}
}
