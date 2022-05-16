import Vue from "vue";
import VueRouter from "vue-router";

import tool from "./tools";

Vue.use(VueRouter);

const AsyncLoad = tool.AsyncLoad;

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => AsyncLoad(import("@/views/home"))
    },
    {
        path: "/partitions/:id",
        name: "Home",
        component: () => AsyncLoad(import("@/views/home"))
    },
    {
        path: "/templates",
        name: "Templates",
        component: () => AsyncLoad(import("@/views/templates"))
    },
    {
        path: "/settings",
        name: "Settings",
        component: () => AsyncLoad(import("@/views/settings"))
    },
    {
        path: "/dev",
        name: "Dev",
        component: () => AsyncLoad(import("@/views/dev"))
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;