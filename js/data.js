/**
 * 数据模块 - 包含演示数据、规范标准、知识库等
 * 可根据实际项目需求扩展
 */

// 全局状态
const AppState = {
    buildingInfo: {},
    monitoringPoints: [],
    detectionResults: {
        crack: [],
        leak: [],
        corrosion: [],
        deformation: []
    },
    ratingResult: null,
    planResult: null
};

// 监测点位类型配置
const MonitorPointTypes = {
    settlement: {
        name: '沉降监测点',
        icon: '📉',
        color: '#1a73e8',
        standard: 'GB/T 50344',
        sensor: '静力水准仪',
        desc: '监测建筑物不均匀沉降'
    },
    tilt: {
        name: '倾斜监测点',
        icon: '📐',
        color: '#52c41a',
        standard: 'GB/T 50344',
        sensor: '倾角传感器',
        desc: '监测建筑物整体倾斜'
    },
    crack: {
        name: '裂缝监测点',
        icon: '🔍',
        color: '#faad14',
        standard: 'GB/T 50344',
        sensor: '裂缝计',
        desc: '监测裂缝宽度变化'
    },
    stress: {
        name: '应力监测点',
        icon: '⚡',
        color: '#ff4d4f',
        standard: 'GB/T 50344',
        sensor: '应变计',
        desc: '监测关键构件应力变化'
    }
};

// 病害类型配置
const DefectTypes = {
    crack: {
        name: '墙体裂缝',
        icon: '🧱',
        color: '#ff4d4f',
        bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)'
    },
    leak: {
        name: '屋面渗漏',
        icon: '💧',
        color: '#1890ff',
        bgColor: 'linear-gradient(135deg, #4facfe, #00f2fe)'
    },
    corrosion: {
        name: '钢筋锈蚀',
        icon: '🦠',
        color: '#faad14',
        bgColor: 'linear-gradient(135deg, #fa709a, #fee140)'
    },
    deformation: {
        name: '变形沉降',
        icon: '📉',
        color: '#722ed1',
        bgColor: 'linear-gradient(135deg, #a18cd1, #fbc2eb)'
    }
};

// 安全性评级标准 (GB 50292-2015)
const SafetyRatingStandard = {
    Au: {
        label: '安全性符合标准要求',
        desc: '不影响整体承载，可正常使用',
        action: '正常使用，定期巡检',
        color: '#52c41a'
    },
    Bu: {
        label: '安全性略低于标准要求',
        desc: '尚不显著影响整体承载',
        action: '加强观察，必要时局部处理',
        color: '#1890ff'
    },
    Cu: {
        label: '安全性不符合标准要求',
        desc: '显著影响整体承载，应采取措施',
        action: '应采取加固或改造措施',
        color: '#faad14'
    },
    Du: {
        label: '安全性严重不符合标准要求',
        desc: '严重影响整体承载，必须立即采取措施',
        action: '必须立即采取措施，必要时停止使用',
        color: '#ff4d4f'
    }
};

// 评级分数到等级的映射
function scoreToGrade(score) {
    if (score >= 90) return 'Au';
    if (score >= 75) return 'Bu';
    if (score >= 60) return 'Cu';
    return 'Du';
}

// 改造措施知识库
const RenovationKnowledgeBase = {
    structure: [
        {
            id: 'S01',
            name: '碳纤维布加固',
            target: '承重墙体/梁',
            trigger: ['墙体裂缝', '承载力不足'],
            method: '采用300g/m²碳纤维布，环氧树脂浸渍胶粘贴',
            cost: 350, // 元/㎡
            period: 7, // 天
            advantage: '施工快、自重轻、不增加截面',
            standard: 'GB 50367-2013'
        },
        {
            id: 'S02',
            name: '外包型钢加固',
            target: '混凝土柱',
            trigger: ['柱裂缝', '柱承载力不足'],
            method: '采用角钢外包，环氧灌缝，外包钢丝网抹灰',
            cost: 800, // 元/㎡
            period: 14,
            advantage: '承载力提升显著，抗震性能好',
            standard: 'GB 50367-2013'
        },
        {
            id: 'S03',
            name: '增大截面加固',
            target: '梁/板',
            trigger: ['梁裂缝', '板挠度超限'],
            method: '增加混凝土截面，配置纵筋和箍筋',
            cost: 600,
            period: 21,
            advantage: '刚度和承载力提升大',
            standard: 'GB 50367-2013'
        },
        {
            id: 'S04',
            name: '地基注浆加固',
            target: '地基基础',
            trigger: ['不均匀沉降', '地基承载力不足'],
            method: '压力注浆水泥浆或化学浆液，提高地基承载力',
            cost: 500,
            period: 10,
            advantage: '不破坏上部结构，施工方便',
            standard: 'JGJ 123-2012'
        }
    ],
    waterproof: [
        {
            id: 'W01',
            name: '屋面卷材防水翻新',
            target: '屋面',
            trigger: ['屋面渗漏'],
            method: '铲除旧防水层，做找平层，铺设SBS改性沥青卷材',
            cost: 120,
            period: 5,
            advantage: '防水寿命长，可达15年以上',
            standard: 'GB 50345-2012'
        },
        {
            id: 'W02',
            name: '外墙防水涂料',
            target: '外墙',
            trigger: ['外墙渗漏'],
            method: '基层处理后涂刷聚合物水泥防水涂料两到三遍',
            cost: 80,
            period: 4,
            advantage: '施工便捷，透气性好',
            standard: 'GB/T 23445-2009'
        },
        {
            id: 'W03',
            name: '地下室注浆堵漏',
            target: '地下室',
            trigger: ['地下室渗漏'],
            method: '高压注浆聚氨酯堵漏剂，封堵渗水通道',
            cost: 200,
            period: 7,
            advantage: '针对性强，止水效果好',
            standard: 'GB 50108-2008'
        }
    ],
    pipeline: [
        {
            id: 'P01',
            name: '给排水管线更新',
            target: '给排水系统',
            trigger: ['管线老化', '漏水'],
            method: '更换PPR给水管、PVC排水管，重新布置管线',
            cost: 150,
            period: 10,
            advantage: '解决跑冒滴漏，水质提升',
            standard: 'GB 50015-2019'
        },
        {
            id: 'P02',
            name: '电气线路改造',
            target: '电气系统',
            trigger: ['线路老化', '负荷不足'],
            method: '更换阻燃BV线，增设漏电保护，更新配电箱',
            cost: 120,
            period: 8,
            advantage: '消除电气火灾隐患',
            standard: 'GB 50054-2011'
        },
        {
            id: 'P03',
            name: '燃气管道更新',
            target: '燃气系统',
            trigger: ['燃气管道锈蚀'],
            method: '更换不锈钢波纹管，安装燃气报警装置',
            cost: 180,
            period: 5,
            advantage: '杜绝燃气泄漏风险',
            standard: 'GB 50028-2006'
        }
    ]
};

// 演示用病害数据
const DemoDefects = {
    crack: [
        {
            id: 'C001',
            location: '一层承重墙A轴',
            width: 0.8,
            length: 1200,
            direction: '竖向',
            confidence: 96,
            severity: 'high',
            desc: '承重墙竖向裂缝，宽度0.8mm，需关注'
        },
        {
            id: 'C002',
            location: '二层楼板B-C轴',
            width: 0.3,
            length: 800,
            direction: '横向',
            confidence: 92,
            severity: 'medium',
            desc: '楼板横向裂缝，宽度0.3mm'
        },
        {
            id: 'C003',
            location: '三层梁L-3',
            width: 0.5,
            length: 1500,
            direction: '斜向',
            confidence: 94,
            severity: 'high',
            desc: '梁斜裂缝，疑似剪切裂缝'
        },
        {
            id: 'C004',
            location: '屋面女儿墙',
            width: 0.2,
            length: 600,
            direction: '水平',
            confidence: 88,
            severity: 'low',
            desc: '女儿墙水平裂缝，温度应力所致'
        }
    ],
    leak: [
        {
            id: 'L001',
            location: '屋面东北角',
            area: 12.5,
            confidence: 95,
            severity: 'high',
            desc: '屋面渗漏明显，防水层老化失效'
        },
        {
            id: 'L002',
            location: '三层卫生间顶板',
            area: 4.2,
            confidence: 90,
            severity: 'medium',
            desc: '卫生间顶板渗漏，防水需重做'
        }
    ],
    corrosion: [
        {
            id: 'R001',
            location: '一层柱Z-1',
            area: 0.8,
            confidence: 87,
            severity: 'medium',
            desc: '柱角钢筋锈蚀，保护层剥落'
        },
        {
            id: 'R002',
            location: '雨棚梁',
            area: 1.2,
            confidence: 85,
            severity: 'high',
            desc: '雨棚梁钢筋锈蚀严重'
        }
    ],
    deformation: [
        {
            id: 'D001',
            location: '整体',
            settlement: 15,
            tilt: 0.003,
            confidence: 98,
            severity: 'medium',
            desc: '不均匀沉降15mm，倾斜率0.003'
        }
    ]
};

// 生成唯一ID
function generateId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
}
