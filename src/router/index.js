// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import ChatWindow from '@/components/ChatWindow.vue';
import CulturalHeritageMap from '@/components/CulturalHeritageMap.vue';
import RAGChat from '@/components/RAGChat.vue';
import HomePage from '@/components/HomePage.vue';
export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomePage,
        },
        {
            path: '/chat',
            name: 'Chat',
            component: ChatWindow,
        },
        {
            path: '/heritage-map',
            name: 'HeritageMap',
            component: CulturalHeritageMap,
        },
        {
            path: '/rag-chat',
            name: 'RAGChat',
            component: RAGChat,
        },
    ],
});
