import { RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
import GlobalNavigation from '@/components/GlobalNavigation.vue';
const route = useRoute();
const isHomePage = computed(() => route.path === '/');
const isChatPage = computed(() => route.path === '/chat');
const isRAGChatPage = computed(() => route.path === '/rag-chat');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: ([
            'app-container',
            { 'chat-background': __VLS_ctx.isChatPage, 'rag-chat-background': __VLS_ctx.isRAGChatPage },
        ]) },
});
if (!__VLS_ctx.isHomePage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "main-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "title" },
    });
    /** @type {[typeof GlobalNavigation, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(GlobalNavigation, new GlobalNavigation({}));
    const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: "./assets/san.png",
        ...{ class: "header-pattern" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: ({ 'main-content': !__VLS_ctx.isHomePage }) },
});
const __VLS_3 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({}));
const __VLS_5 = __VLS_4({}, ...__VLS_functionalComponentArgsRest(__VLS_4));
if (!__VLS_ctx.isHomePage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "main-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-background']} */ ;
/** @type {__VLS_StyleScopedClasses['rag-chat-background']} */ ;
/** @type {__VLS_StyleScopedClasses['main-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-pattern']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['main-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterView: RouterView,
            GlobalNavigation: GlobalNavigation,
            isHomePage: isHomePage,
            isChatPage: isChatPage,
            isRAGChatPage: isRAGChatPage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
