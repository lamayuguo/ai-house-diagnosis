/**
 * 主应用逻辑
 * 负责页面交互、流程控制、各模块调用
 */

// 当前步骤
let currentStep = 1;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // 文件上传拖拽
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // 默认加载演示数据
    console.log('AI住宅卫士平台已启动');
}

// 处理文件上传
function handleFiles(files) {
    if (files.length > 0) {
        showModal('文件已接收', `已接收 ${files.length} 张影像，点击"开始AI识别"进行病害识别。`);
    }
}

// 切换步骤
function goToStep(step) {
    // 隐藏所有面板
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    // 显示目标面板
    document.getElementById('panel-' + step).classList.add('active');
    
    // 更新进度条
    document.querySelectorAll('.step').forEach(s => {
        const sNum = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        if (sNum < step) s.classList.add('completed');
        if (sNum === step) s.classList.add('active');
    });
    
    currentStep = step;
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Step 1: 监测布点 ==========

// 加载演示数据
function loadDemoData() {
    document.getElementById('buildingName').value = '某中学食堂及宿舍楼';
    document.getElementById('structureType').value = 'concrete';
    document.getElementById('floorCount').value = 5;
    document.getElementById('area').value = 3200;
    document.getElementById('buildYear').value = 2001;
    document.getElementById('seismicIntensity').value = '7度';
    
    showModal('演示数据已加载', '建筑信息已填充，可点击"生成监测布点方案"继续。');
}

// 生成监测布点方案
function generateMonitoringPoints() {
    // 收集建筑信息
    AppState.buildingInfo = {
        name: document.getElementById('buildingName').value,
        structureType: document.getElementById('structureType').value,
        floorCount: parseInt(document.getElementById('floorCount').value),
        area: parseInt(document.getElementById('area').value),
        buildYear: parseInt(document.getElementById('buildYear').value),
        seismicIntensity: document.getElementById('seismicIntensity').value
    };
    
    // 计算监测点位
    const floors = AppState.buildingInfo.floorCount;
    const points = {
        settlement: Math.max(4, floors * 2),      // 沉降点
        tilt: Math.max(2, Math.ceil(floors / 2)),  // 倾斜点
        crack: 6,                                   // 裂缝监测点
        stress: Math.max(2, Math.ceil(floors / 3))  // 应力点
    };
    
    AppState.monitoringPoints = points;
    
    // 渲染监测卡片
    const cardsHtml = Object.entries(points).map(([type, count]) => {
        const config = MonitorPointTypes[type];
        return `
            <div class="monitor-card" style="border-left-color:${config.color}">
                <h4>${config.icon} ${config.name}</h4>
                <div class="count">${count} 个</div>
                <div class="desc">${config.desc}</div>
                <div class="desc">传感器：${config.sensor}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('monitoringCards').innerHTML = cardsHtml;
    
    // 绘制布局图
    drawLayoutDiagram(points);
    
    // 显示结果
    document.getElementById('monitoringResult').classList.remove('hidden');
    
    showModal('监测布点完成', `已生成 ${Object.values(points).reduce((a,b)=>a+b,0)} 个监测点位，包含沉降、倾斜、裂缝、应力四类监测。`);
}

// 绘制布局示意图
function drawLayoutDiagram(points) {
    const canvas = document.getElementById('layoutCanvas');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制建筑轮廓
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.fillRect(100, 80, 600, 240);
    ctx.strokeRect(100, 80, 600, 240);
    
    // 绘制房间网格
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(100 + i * 150, 80);
        ctx.lineTo(100 + i * 150, 320);
        ctx.stroke();
    }
    for (let i = 1; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(100, 80 + i * 120);
        ctx.lineTo(700, 80 + i * 120);
        ctx.stroke();
    }
    
    // 绘制监测点
    const allPoints = [
        // 沉降点（四角）
        { x: 100, y: 80, type: 'settlement' },
        { x: 700, y: 80, type: 'settlement' },
        { x: 100, y: 320, type: 'settlement' },
        { x: 700, y: 320, type: 'settlement' },
        { x: 400, y: 80, type: 'settlement' },
        { x: 400, y: 320, type: 'settlement' },
        // 倾斜点
        { x: 200, y: 140, type: 'tilt' },
        { x: 600, y: 260, type: 'tilt' },
        // 裂缝点
        { x: 250, y: 200, type: 'crack' },
        { x: 550, y: 200, type: 'crack' },
        { x: 400, y: 140, type: 'crack' },
        { x: 400, y: 260, type: 'crack' },
        { x: 300, y: 200, type: 'crack' },
        { x: 500, y: 200, type: 'crack' },
        // 应力点
        { x: 350, y: 140, type: 'stress' },
        { x: 450, y: 260, type: 'stress' }
    ];
    
    allPoints.forEach(p => {
        const config = MonitorPointTypes[p.type];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // 图例
    const legendY = 360;
    let legendX = 100;
    Object.entries(MonitorPointTypes).forEach(([key, config]) => {
        ctx.beginPath();
        ctx.arc(legendX, legendY, 8, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${config.name} (${points[key]})`, legendX + 12, legendY + 4);
        legendX += 160;
    });
}

// ========== Step 2: AI病害识别 ==========

// 运行AI识别
async function runAIDetection() {
    showModal('AI识别中', '<div class="loading"></div> 正在进行病害智能识别，请稍候...', false);
    
    // 模拟AI识别过程
    await AIDetection.detect();
    
    // 加载演示结果
    const results = AIDetection.loadDemoResults();
    
    closeModal();
    renderDetectionResults(results);
}

// 使用演示识别结果
function loadDemoDetection() {
    const results = AIDetection.loadDemoResults();
    renderDetectionResults(results);
}

// 渲染识别结果
function renderDetectionResults(results) {
    // 统计数据
    const stats = AIDetection.getStats();
    document.getElementById('totalImages').textContent = stats.totalImages;
    document.getElementById('totalDefects').textContent = stats.totalDefects;
    document.getElementById('seriousDefects').textContent = stats.seriousDefects;
    document.getElementById('avgConfidence').textContent = stats.avgConfidence + '%';
    
    // 各类型数量
    document.getElementById('crackCount').textContent = results.crack.length;
    document.getElementById('leakCount').textContent = results.leak.length;
    document.getElementById('corrosionCount').textContent = results.corrosion.length;
    document.getElementById('deformCount').textContent = results.deformation.length;
    
    // 渲染各类型病害列表
    document.getElementById('crackList').innerHTML = results.crack.map(d => AIDetection.renderDefectCard(d, 'crack')).join('');
    document.getElementById('leakList').innerHTML = results.leak.map(d => AIDetection.renderDefectCard(d, 'leak')).join('');
    document.getElementById('corrosionList').innerHTML = results.corrosion.map(d => AIDetection.renderDefectCard(d, 'corrosion')).join('');
    document.getElementById('deformList').innerHTML = results.deformation.map(d => AIDetection.renderDefectCard(d, 'deformation')).join('');
    
    // 显示结果
    document.getElementById('detectionResult').classList.remove('hidden');
}

// 切换病害标签
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

// ========== Step 3: 安全性评级 ==========

function runSafetyRating() {
    // 检查是否有识别结果
    const stats = AIDetection.getStats();
    if (stats.totalDefects === 0) {
        showModal('提示', '请先完成AI病害识别，或使用演示识别结果。');
        return;
    }
    
    // 执行评级
    const result = SafetyRating.evaluate();
    SafetyRating.renderResult(result);
    
    document.getElementById('ratingResult').classList.remove('hidden');
    
    const standard = SafetyRatingStandard[result.overallGrade];
    showModal('评级完成', `该建筑安全性评级为 <strong style="color:${standard.color}">${result.overallGrade} 级</strong>，${standard.desc}。`);
}

// ========== Step 4: 改造方案生成 ==========

function generatePlan() {
    if (!AppState.ratingResult) {
        showModal('提示', '请先完成安全性评级。');
        return;
    }
    
    const plan = PlanGenerator.generate();
    PlanGenerator.renderResult(plan);
    
    document.getElementById('planResult').classList.remove('hidden');
    
    showModal('方案生成完成', `已生成 ${plan.measures.length} 项改造措施，总造价约 ${plan.totalCost.toFixed(2)} 万元。`);
}

// 切换方案标签
function switchPlanTab(tab) {
    document.querySelectorAll('.plan-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.plan-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.plan-tab[data-plan="${tab}"]`).classList.add('active');
    document.getElementById('plan-' + tab).classList.add('active');
}

// ========== Step 5: 报告生成 ==========

function generateReport() {
    if (!AppState.planResult) {
        showModal('提示', '请先完成改造方案生成。');
        return;
    }
    
    ReportGenerator.generate();
    document.getElementById('reportResult').classList.remove('hidden');
    
    showModal('报告生成完成', '鉴定报告已生成，可点击"打印/导出PDF"导出。');
}

// ========== 模态框 ==========

function showModal(title, body, closable = true) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modal').classList.add('active');
    
    if (!closable) {
        document.querySelector('.modal-close').style.display = 'none';
    } else {
        document.querySelector('.modal-close').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// 点击模态框外部关闭
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
