/**
 * 改造方案生成模块
 * 基于评级结果和病害清单，从知识库匹配改造措施
 */

const PlanGenerator = {
    // 生成改造方案
    generate() {
        const defects = AppState.detectionResults;
        const rating = AppState.ratingResult;
        
        const plan = {
            structure: [],
            waterproof: [],
            pipeline: [],
            totalCost: 0,
            totalPeriod: 0,
            measures: []
        };
        
        // 1. 结构加固方案
        plan.structure = this.matchStructureMeasures(defects);
        
        // 2. 防水翻新方案
        plan.waterproof = this.matchWaterproofMeasures(defects);
        
        // 3. 管线更新方案
        plan.pipeline = this.matchPipelineMeasures(defects);
        
        // 4. 成本测算
        const area = AppState.buildingInfo.area || 3200;
        plan.measures = [...plan.structure, ...plan.waterproof, ...plan.pipeline];
        
        let totalCost = 0;
        let totalPeriod = 0;
        
        plan.measures.forEach(m => {
            totalCost += m.estimatedCost;
            totalPeriod = Math.max(totalPeriod, m.period);
        });
        
        plan.totalCost = totalCost;
        plan.totalPeriod = totalPeriod;
        plan.costPerArea = Math.round(totalCost * 10000 / area); // 元/㎡
        
        AppState.planResult = plan;
        return plan;
    },

    // 匹配结构加固措施
    matchStructureMeasures(defects) {
        const measures = [];
        const area = AppState.buildingInfo.area || 3200;
        
        // 墙体裂缝 → 碳纤维加固
        const wallCracks = defects.crack.filter(d => d.location.includes('墙') && d.severity !== 'low');
        if (wallCracks.length > 0) {
            const measure = RenovationKnowledgeBase.structure[0]; // 碳纤维布加固
            const workArea = Math.ceil(area * 0.08); // 假设8%面积需加固
            measures.push({
                ...measure,
                workArea: workArea,
                estimatedCost: measure.cost * workArea / 10000, // 万元
                trigger: `墙体裂缝${wallCracks.length}处`,
                quantity: workArea
            });
        }
        
        // 梁裂缝 → 增大截面或外包钢
        const beamCracks = defects.crack.filter(d => d.location.includes('梁'));
        if (beamCracks.length > 0) {
            const measure = RenovationKnowledgeBase.structure[2]; // 增大截面加固
            const workArea = Math.ceil(area * 0.05);
            measures.push({
                ...measure,
                workArea: workArea,
                estimatedCost: measure.cost * workArea / 10000,
                trigger: `梁裂缝${beamCracks.length}处`,
                quantity: workArea
            });
        }
        
        // 柱锈蚀 → 外包型钢加固
        const columnCorrosion = defects.corrosion.filter(d => d.location.includes('柱'));
        if (columnCorrosion.length > 0) {
            const measure = RenovationKnowledgeBase.structure[1]; // 外包型钢加固
            const workArea = columnCorrosion.length * 8;
            measures.push({
                ...measure,
                workArea: workArea,
                estimatedCost: measure.cost * workArea / 10000,
                trigger: `柱钢筋锈蚀${columnCorrosion.length}处`,
                quantity: workArea
            });
        }
        
        // 地基沉降 → 注浆加固
        const deformation = defects.deformation;
        if (deformation.length > 0 && deformation[0].settlement > 10) {
            const measure = RenovationKnowledgeBase.structure[3]; // 地基注浆加固
            const workArea = Math.ceil(area * 0.15);
            measures.push({
                ...measure,
                workArea: workArea,
                estimatedCost: measure.cost * workArea / 10000,
                trigger: `不均匀沉降${deformation[0].settlement}mm`,
                quantity: workArea
            });
        }
        
        return measures;
    },

    // 匹配防水翻新措施
    matchWaterproofMeasures(defects) {
        const measures = [];
        const area = AppState.buildingInfo.area || 3200;
        
        // 屋面渗漏 → 卷材防水
        const roofLeak = defects.leak.filter(d => d.location.includes('屋面'));
        if (roofLeak.length > 0) {
            const measure = RenovationKnowledgeBase.waterproof[0];
            const roofArea = Math.ceil(area / AppState.buildingInfo.floorCount * 1.2);
            measures.push({
                ...measure,
                workArea: roofArea,
                estimatedCost: measure.cost * roofArea / 10000,
                trigger: `屋面渗漏${roofLeak.length}处`,
                quantity: roofArea
            });
        }
        
        // 其他渗漏 → 防水涂料
        const otherLeak = defects.leak.filter(d => !d.location.includes('屋面'));
        if (otherLeak.length > 0) {
            const measure = RenovationKnowledgeBase.waterproof[1];
            const wallArea = otherLeak.reduce((sum, d) => sum + d.area * 10, 0);
            measures.push({
                ...measure,
                workArea: Math.ceil(wallArea),
                estimatedCost: measure.cost * Math.ceil(wallArea) / 10000,
                trigger: `外墙/室内渗漏${otherLeak.length}处`,
                quantity: Math.ceil(wallArea)
            });
        }
        
        return measures;
    },

    // 匹配管线更新措施
    matchPipelineMeasures(defects) {
        const measures = [];
        const area = AppState.buildingInfo.area || 3200;
        
        // 假设老旧建筑管线均需更新（服役超20年）
        const buildYear = AppState.buildingInfo.buildYear || 2001;
        const age = new Date().getFullYear() - buildYear;
        
        if (age > 15) {
            // 给排水管线
            const p1 = RenovationKnowledgeBase.pipeline[0];
            measures.push({
                ...p1,
                workArea: area,
                estimatedCost: p1.cost * area / 10000,
                trigger: `建筑服役${age}年，管线老化`,
                quantity: area
            });
            
            // 电气线路
            const p2 = RenovationKnowledgeBase.pipeline[1];
            measures.push({
                ...p2,
                workArea: area,
                estimatedCost: p2.cost * area / 10000,
                trigger: `电气线路老化，负荷不足`,
                quantity: area
            });
        }
        
        return measures;
    },

    // 渲染方案结果
    renderResult(plan) {
        // 概览数据
        document.getElementById('planCount').textContent = plan.measures.length;
        document.getElementById('totalCost').textContent = plan.totalCost.toFixed(2);
        document.getElementById('planPeriod').textContent = plan.totalPeriod;
        document.getElementById('costPerArea').textContent = plan.costPerArea;
        
        // 结构加固
        document.getElementById('structurePlan').innerHTML = this.renderMeasureList(plan.structure);
        
        // 防水翻新
        document.getElementById('waterproofPlan').innerHTML = this.renderMeasureList(plan.waterproof);
        
        // 管线更新
        document.getElementById('pipelinePlan').innerHTML = this.renderMeasureList(plan.pipeline);
        
        // 成本测算表
        this.renderCostTable(plan);
    },

    // 渲染措施列表
    renderMeasureList(measures) {
        if (measures.length === 0) {
            return '<div style="padding:20px;text-align:center;color:#999">暂无相关改造措施</div>';
        }
        
        return measures.map(m => `
            <div class="plan-item">
                <div class="plan-item-header">
                    <h5>${m.name} <span style="font-size:12px;color:#999;font-weight:normal">${m.id}</span></h5>
                    <span class="plan-cost">约 ${m.estimatedCost.toFixed(2)} 万元</span>
                </div>
                <div class="plan-item-desc">
                    <strong>适用部位：</strong>${m.target}<br>
                    <strong>触发条件：</strong>${m.trigger}<br>
                    <strong>施工方法：</strong>${m.method}<br>
                    <strong>工程量：</strong>${m.quantity} ${m.target.includes('地基') ? '㎡' : '㎡'}<br>
                    <strong>执行标准：</strong>${m.standard}
                </div>
                <div class="plan-item-tags">
                    <span class="plan-tag">优势：${m.advantage}</span>
                    <span class="plan-tag">工期：${m.period}天</span>
                </div>
            </div>
        `).join('');
    },

    // 渲染成本测算表
    renderCostTable(plan) {
        const rows = plan.measures.map(m => `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.target}</td>
                <td>${m.quantity} ㎡</td>
                <td>${m.cost} 元/㎡</td>
                <td>${m.estimatedCost.toFixed(2)} 万元</td>
            </tr>
        `).join('');
        
        document.getElementById('costTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>编号</th>
                        <th>措施名称</th>
                        <th>适用部位</th>
                        <th>工程量</th>
                        <th>单价</th>
                        <th>合价</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="cost-total">
                        <td colspan="5">合计</td>
                        <td>${plan.totalCost.toFixed(2)} 万元</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top:16px;padding:16px;background:#f6ffed;border-radius:8px;font-size:13px;color:#555">
                <strong>💡 成本分析：</strong>
                本次改造总造价约 <strong>${plan.totalCost.toFixed(2)}万元</strong>，
                单方造价约 <strong>${plan.costPerArea}元/㎡</strong>，
                预计工期 <strong>${plan.totalPeriod}天</strong>。
                相比拆除重建（约${(plan.totalCost * 5).toFixed(0)}万元），
                可节约投资约 <strong>${((1 - 1/5) * 100).toFixed(0)}%</strong>，
                具有显著的经济效益。
            </div>
        `;
    }
};
