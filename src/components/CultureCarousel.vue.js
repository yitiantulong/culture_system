import { ref } from 'vue';
// 响应式数据（带完整类型注解）
const items = ref([
    {
        title: '昆曲',
        description: '中国最古老的剧种之一',
        image: '/images/kunqu.jpg' // 确保图片位于 public/images 目录
    },
    {
        title: '剪纸',
        description: '千年传承的民间艺术',
        image: '/images/papercut.jpg'
    }
]);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['carousel-image']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "carousel-container" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "carousel-item" },
        key: (index),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
        src: (item.image),
        alt: (item.title),
        ...{ class: "carousel-image" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "carousel-caption" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "caption-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "caption-description" },
    });
    (item.description);
}
/** @type {__VLS_StyleScopedClasses['carousel-container']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-item']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-image']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-title']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            items: items,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
