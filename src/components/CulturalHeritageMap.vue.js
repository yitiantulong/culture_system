import { ref, onMounted, computed, onUnmounted } from 'vue';
const provinces = {
    北京市: {
        name: '北京市',
        stats: {
            folk: 8,
            music: 4,
            dance: 9,
            opera: 5,
            art: 7,
            sports: 12,
            crafts: 41,
            medicine: 9,
        },
        coordinates: [116.3912757, 39.906217],
    },
    上海市: {
        name: '上海市',
        stats: {
            folk: 2,
            music: 9,
            dance: 4,
            opera: 7,
            art: 5,
            sports: 4,
            crafts: 19,
            medicine: 11,
        },
        coordinates: [121.4737, 31.2304],
    },
    广东省: {
        name: '广东省',
        stats: {
            folk: 4,
            music: 13,
            dance: 32,
            opera: 21,
            art: 5,
            sports: 5,
            crafts: 18,
            medicine: 10,
        },
        coordinates: [113.2592945, 23.1301964],
    },
    浙江省: {
        name: '浙江省',
        stats: {
            folk: 24,
            music: 15,
            dance: 18,
            opera: 25,
            art: 28,
            sports: 12,
            crafts: 54,
            medicine: 12,
        },
        coordinates: [120.2052342, 29.2489634],
    },
    江苏省: {
        name: '江苏省',
        stats: {
            folk: 11,
            music: 21,
            dance: 9,
            opera: 22,
            art: 10,
            sports: 2,
            crafts: 38,
            medicine: 6,
        },
        coordinates: [119.1075773, 33.5524785],
    },
    福建省: {
        name: '福建省',
        stats: {
            folk: 2,
            music: 8,
            dance: 5,
            opera: 4,
            art: 5,
            sports: 4,
            crafts: 7,
            medicine: 6,
        },
        coordinates: [118.2918215, 26.0774954],
    },
    山东省: {
        name: '山东省',
        stats: {
            folk: 27,
            music: 18,
            dance: 13,
            opera: 33,
            art: 13,
            sports: 15,
            crafts: 19,
            medicine: 6,
        },
        coordinates: [118.0, 36.0],
    },
    河南省: {
        name: '河南省',
        stats: {
            folk: 10,
            music: 13,
            dance: 10,
            opera: 29,
            art: 5,
            sports: 10,
            crafts: 14,
            medicine: 6,
        },
        coordinates: [113.6191483, 33.7487244],
    },
    湖北省: {
        name: '湖北省',
        stats: {
            folk: 21,
            music: 28,
            dance: 12,
            opera: 25,
            art: 13,
            sports: 4,
            crafts: 10,
            medicine: 6,
        },
        coordinates: [113.2919, 30.5928],
    },
    湖南省: {
        name: '湖南省',
        stats: {
            folk: 9,
            music: 16,
            dance: 13,
            opera: 32,
            art: 6,
            sports: 4,
            crafts: 19,
            medicine: 6,
        },
        coordinates: [112.4834, 27.9111],
    },
    江西省: {
        name: '江西省',
        stats: {
            folk: 1,
            music: 7,
            dance: 11,
            opera: 17,
            art: 6,
            sports: 1,
            crafts: 21,
            medicine: 1,
        },
        coordinates: [115.8921, 27.6765],
    },
    安徽省: {
        name: '安徽省',
        stats: {
            folk: 5,
            music: 9,
            dance: 10,
            opera: 25,
            art: 2,
            sports: 4,
            crafts: 25,
            medicine: 3,
        },
        coordinates: [117.2218033, 31.8228094],
    },
    陕西省: {
        name: '陕西省',
        stats: {
            folk: 7,
            music: 15,
            dance: 6,
            opera: 18,
            art: 8,
            sports: 2,
            crafts: 12,
            medicine: 2,
        },
        coordinates: [109.0861893, 34.53727],
    },
    山西省: {
        name: '山西省',
        stats: {
            folk: 10,
            music: 18,
            dance: 14,
            opera: 38,
            art: 11,
            sports: 6,
            crafts: 35,
            medicine: 8,
        },
        coordinates: [112.5489, 36.8706],
    },
    河北省: {
        name: '河北省',
        stats: {
            folk: 5,
            music: 23,
            dance: 11,
            opera: 36,
            art: 9,
            sports: 24,
            crafts: 21,
            medicine: 4,
        },
        coordinates: [114.5391, 38.0428],
    },
    吉林省: {
        name: '吉林省',
        stats: {
            folk: 2,
            music: 10,
            dance: 6,
            opera: 3,
            art: 6,
            sports: 5,
            crafts: 6,
            medicine: 12,
        },
        coordinates: [126.5287796, 42.8016143],
    },
    辽宁省: {
        name: '辽宁省',
        stats: {
            folk: 6,
            music: 9,
            dance: 9,
            opera: 10,
            art: 12,
            sports: 2,
            crafts: 4,
            medicine: 2,
        },
        coordinates: [123.4315, 41.8057],
    },
    黑龙江省: {
        name: '黑龙江省',
        stats: {
            folk: 1,
            music: 7,
            dance: 1,
            opera: 3,
            art: 7,
            sports: 1,
            crafts: 6,
            medicine: 2,
        },
        coordinates: [126.6424, 45.7574],
    },
    四川省: {
        name: '四川省',
        stats: {
            folk: 7,
            music: 23,
            dance: 20,
            opera: 11,
            art: 6,
            sports: 4,
            crafts: 38,
            medicine: 3,
        },
        coordinates: [104.0633717, 30.6598628],
    },
    云南省: {
        name: '云南省',
        stats: {
            folk: 19,
            music: 14,
            dance: 30,
            opera: 17,
            art: 2,
            sports: 2,
            crafts: 24,
            medicine: 6,
        },
        coordinates: [101.7103, 24.0389],
    },
    贵州省: {
        name: '贵州省',
        stats: {
            folk: 11,
            music: 20,
            dance: 17,
            opera: 14,
            art: 3,
            sports: 4,
            crafts: 31,
            medicine: 9,
        },
        coordinates: [106.7142, 26.5783],
    },
    青海省: {
        name: '青海省',
        stats: {
            folk: 9,
            music: 15,
            dance: 9,
            opera: 3,
            art: 4,
            sports: 3,
            crafts: 11,
            medicine: 6,
        },
        coordinates: [97.7761976, 36.617331],
    },
    甘肃省: {
        name: '甘肃省',
        stats: {
            folk: 7,
            music: 12,
            dance: 11,
            opera: 11,
            art: 7,
            sports: 1,
            crafts: 12,
            medicine: 2,
        },
        coordinates: [103.8318566, 36.0620781],
    },
    新疆维吾尔自治区: {
        name: '新疆',
        stats: {
            folk: 19,
            music: 28,
            dance: 16,
            opera: 0,
            art: 5,
            sports: 9,
            crafts: 25,
            medicine: 7,
        },
        coordinates: [87.6139038, 43.8244074],
    },
    西藏自治区: {
        name: '西藏',
        stats: {
            folk: 3,
            music: 6,
            dance: 33,
            opera: 9,
            art: 1,
            sports: 2,
            crafts: 18,
            medicine: 9,
        },
        coordinates: [94.3602321, 29.6510453],
    },
    内蒙古自治区: {
        name: '内蒙古',
        stats: {
            folk: 8,
            music: 23,
            dance: 5,
            opera: 5,
            art: 6,
            sports: 9,
            crafts: 15,
            medicine: 7,
        },
        coordinates: [111.6730788, 40.8337963],
    },
    广西壮族自治区: {
        name: '广西',
        stats: {
            folk: 6,
            music: 9,
            dance: 9,
            opera: 7,
            art: 3,
            sports: 1,
            crafts: 8,
            medicine: 1,
        },
        coordinates: [108.3207, 22.8152],
    },
    宁夏回族自治区: {
        name: '宁夏',
        stats: {
            folk: 1,
            music: 3,
            dance: 1,
            opera: 1,
            art: 1,
            sports: 0,
            crafts: 7,
            medicine: 4,
        },
        coordinates: [106.2719, 38.4681],
    },
    海南省: {
        name: '海南省',
        stats: {
            folk: 0,
            music: 11,
            dance: 3,
            opera: 6,
            art: 0,
            sports: 0,
            crafts: 12,
            medicine: 0,
        },
        coordinates: [110.3487, 20.0179],
    },
};
const mapCanvas = ref(null);
const selectedProvince = ref(null);
const hoveredProvince = ref(null);
const totalHeritageItems = computed(() => {
    return Object.values(provinces).reduce((total, province) => {
        return total + calculateTotal(province.stats);
    }, 0);
});
function calculateTotal(stats) {
    return Object.values(stats).reduce((sum, value) => sum + value, 0);
}
const animationFrame = ref(0);
const pulseScale = ref(1);
const pulseDirection = ref(1);
function animate() {
    // 更新脉冲动画
    pulseScale.value += pulseDirection.value * 0.01;
    if (pulseScale.value >= 1.2)
        pulseDirection.value = -1;
    if (pulseScale.value <= 1)
        pulseDirection.value = 1;
    // 重绘地图
    const canvas = mapCanvas.value;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            drawMap(ctx);
        }
    }
    // 继续动画循环
    animationFrame.value = requestAnimationFrame(animate);
}
const mapData = ref(null);
const isLoading = ref(false);
const error = ref(null);
// 获取地图数据
async function fetchMapData() {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await fetch('https://geojson.cn/api/china/100000.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        mapData.value = data;
        // 重新绘制地图
        const canvas = mapCanvas.value;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawMap(ctx);
            }
        }
    }
    catch (err) {
        console.error('Failed to fetch map data:', err);
        error.value = '地图数据加载失败，请刷新页面重试';
    }
    finally {
        isLoading.value = false;
    }
}
function drawMap(ctx) {
    // 清除画布并设置透明背景
    ctx.clearRect(0, 0, 1000, 700);
    // 如果有地图数据，绘制地图轮廓
    if (mapData.value) {
        ctx.strokeStyle = '#8b572a';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(87, 4, 4, 0.3)';
        mapData.value.features.forEach((feature) => {
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates;
                drawPolygon(ctx, coordinates[0]);
            }
            else if (feature.geometry.type === 'MultiPolygon') {
                const coordinates = feature.geometry.coordinates;
                coordinates.forEach((polygon) => {
                    drawPolygon(ctx, polygon[0]);
                });
            }
        });
    }
    // 绘制省份名称和数据点
    Object.values(provinces).forEach((province) => {
        const [x, y] = transformCoordinates(province.coordinates);
        // 判断是否是选中或悬停的省份
        const isActive = province === selectedProvince.value || province === hoveredProvince.value;
        // 计算点的大小
        const baseSize = isActive ? 8 : 6;
        const size = isActive ? baseSize * pulseScale.value : baseSize;
        // 绘制光晕效果
        if (isActive) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fill();
        }
        // 绘制数据点
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#ffffff' : '#f0e5d8';
        ctx.fill();
        ctx.strokeStyle = isActive ? '#ffffff' : '#570404';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.stroke();
        // 绘制省份名称
        ctx.fillStyle = isActive ? '#ffffff' : '#d4b895';
        ctx.font = isActive ? 'bold 14px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(province.name, x, y - 15);
        // 如果是悬停状态，显示总数
        if (isActive) {
            const total = calculateTotal(province.stats);
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`总计: ${total}`, x, y + 25);
        }
    });
}
// 绘制多边形
function drawPolygon(ctx, coordinates) {
    if (coordinates.length === 0)
        return;
    ctx.beginPath();
    const [startX, startY] = transformCoordinates(coordinates[0]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coordinates.length; i++) {
        const [x, y] = transformCoordinates(coordinates[i]);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
// 坐标转换函数
function transformCoordinates([lon, lat]) {
    // 中国地图范围
    const bounds = {
        west: 73.5,
        east: 135.0,
        south: 18.2,
        north: 53.5,
    };
    // 转换为画布坐标，增加缩放比例使地图更大
    const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * 800 + 30;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 600 + 30;
    return [x, y];
}
// 添加点击事件处理
function handleMapClick(event) {
    const canvas = mapCanvas.value;
    if (!canvas)
        return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 检查是否点击了某个省份的点
    Object.values(provinces).forEach((province) => {
        const [px, py] = transformCoordinates(province.coordinates);
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance <= 6) {
            selectedProvince.value = province;
        }
    });
}
function handleMapMouseMove(event) {
    const canvas = mapCanvas.value;
    if (!canvas)
        return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 检查是否悬停在某个省份的点上
    let found = false;
    Object.values(provinces).forEach((province) => {
        const [px, py] = transformCoordinates(province.coordinates);
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance <= 6) {
            hoveredProvince.value = province;
            found = true;
            canvas.style.cursor = 'pointer';
        }
    });
    if (!found) {
        hoveredProvince.value = null;
        canvas.style.cursor = 'default';
    }
    // 重新绘制地图以更新悬停效果
    const ctx = canvas.getContext('2d');
    if (ctx) {
        drawMap(ctx);
    }
}
onMounted(() => {
    initializeMap();
    // 获取地图数据
    fetchMapData();
    // 添加事件监听
    const canvas = mapCanvas.value;
    if (canvas) {
        canvas.addEventListener('click', handleMapClick);
        canvas.addEventListener('mousemove', handleMapMouseMove);
    }
    // 启动动画
    animate();
});
onUnmounted(() => {
    // 清理事件监听
    const canvas = mapCanvas.value;
    if (canvas) {
        canvas.removeEventListener('click', handleMapClick);
        canvas.removeEventListener('mousemove', handleMapMouseMove);
    }
    // 停止动画
    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
    }
});
function initializeMap() {
    if (!mapCanvas.value)
        return;
    const ctx = mapCanvas.value.getContext('2d');
    if (!ctx)
        return;
    // 设置画布大小
    mapCanvas.value.width = 800;
    mapCanvas.value.height = 600;
    // 绘制地图和点位的代码将在这里实现
    drawMap(ctx);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-area']} */ ;
/** @type {__VLS_StyleScopedClasses['province-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['map-footer-info']} */ ;
/** @type {__VLS_StyleScopedClasses['map-footer-info']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "heritage-map-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-note" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "note-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-background" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-border" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-area" },
    ref: "mapArea",
});
/** @type {typeof __VLS_ctx.mapArea} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "mapCanvas",
});
/** @type {typeof __VLS_ctx.mapCanvas} */ ;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-text" },
    });
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-message" },
    });
    (__VLS_ctx.error);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.fetchMapData) },
        ...{ class: "retry-button" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "map-footer-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "total-items" },
});
(__VLS_ctx.totalHeritageItems);
if (__VLS_ctx.selectedProvince) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "province-stats" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.selectedProvince.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.folk || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.music || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.dance || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.opera || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.art || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.sports || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.crafts || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-number" },
    });
    (__VLS_ctx.selectedProvince.stats.medicine || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-label" },
    });
}
/** @type {__VLS_StyleScopedClasses['heritage-map-container']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['map-note']} */ ;
/** @type {__VLS_StyleScopedClasses['note-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['map-content']} */ ;
/** @type {__VLS_StyleScopedClasses['map-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['map-background']} */ ;
/** @type {__VLS_StyleScopedClasses['map-border']} */ ;
/** @type {__VLS_StyleScopedClasses['map-area']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-text']} */ ;
/** @type {__VLS_StyleScopedClasses['error-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['retry-button']} */ ;
/** @type {__VLS_StyleScopedClasses['map-footer-info']} */ ;
/** @type {__VLS_StyleScopedClasses['total-items']} */ ;
/** @type {__VLS_StyleScopedClasses['province-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            mapCanvas: mapCanvas,
            selectedProvince: selectedProvince,
            totalHeritageItems: totalHeritageItems,
            isLoading: isLoading,
            error: error,
            fetchMapData: fetchMapData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
