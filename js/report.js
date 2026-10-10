/**
 * 鉴定报告生成模块
 * 依据GB 50292-2015等标准生成规范的鉴定报告
 */

const ReportGenerator = {
    // 生成报告
    generate() {
        const building = AppState.buildingInfo;
        const defects = AppState.detectionResults;
        const rating = AppState.ratingResult;
        const plan = AppState.planResult;
        
        const reportHtml = this.buildReport(building, defects, rating, plan);
        document.getElementById('reportBody').innerHTML = reportHtml;
    },

    buildReport(building, defects, rating, plan) {
        const standard = SafetyRatingStandard[rating.overallGrade];
        const allDefects = [
            ...defects.crack, ...defects.leak, ...defects.corrosion, ...defects.deformation
        ];
        
        return `
            <h3>一、工程概况</h3>
            <p>本工程为 ${building.name || '某中学食堂及宿舍楼'}，结构类型为 ${this.getStructureTypeName(building.structureType)}，
            建筑面积 ${building.area} ㎡，地上 ${building.floorCount} 层，建于 ${building.buildYear} 年，
            抗震设防烈度为 ${building.seismicIntensity}。该建筑至今已服役约 ${new Date().getFullYear() - building.buildYear} 年。</p>
            
            <h3>二、检测依据</h3>
            <p>1.《民用建筑可靠性鉴定标准》GB 50292-2015；</p>
            <p>2.《既有建筑鉴定与加固通用规范》GB 55021-2021；</p>
            <p>3.《建筑结构检测技术标准》GB/T 50344-2019；</p>
            <p>4.《混凝土结构加固设计规范》GB 50367-2013。</p>
            
            <h3>三、检测内容与方法</h3>
            <p>本次检测采用AI图像识别与现场调查相结合的方法，对建筑的结构安全性进行全面鉴定。
            主要检测内容包括：墙体裂缝检测、屋面渗漏检测、钢筋锈蚀检测、沉降倾斜监测等。
            共识别各类病害 ${allDefects.length} 处，其中严重病害 ${allDefects.filter(d => d.severity === 'high').length} 处。</p>
            
            <h3>四、病害检测结果</h3>
            <table>
                <thead>
                    <tr><th>病害类型</th><th>数量</th><th>严重病害</th><th>主要分布</th></tr>
                </thead>
                <tbody>
                    <tr><td>墙体裂缝</td><td>${defects.crack.length}处</td><td>${defects.crack.filter(d=>d.severity==='high').length}处</td><td>承重墙、梁、楼板</td></tr>
                    <tr><td>屋面渗漏</td><td>${defects.leak.length}处</td><td>${defects.leak.filter(d=>d.severity==='high').length}处</td><td>屋面、卫生间</td></tr>
                    <tr><td>钢筋锈蚀</td><td>${defects.corrosion.length}处</td><td>${defects.corrosion.filter(d=>d.severity==='high').length}处</td><td>柱、雨棚梁</td></tr>
                    <tr><td>变形沉降</td><td>${defects.deformation.length}处</td><td>${defects.deformation.filter(d=>d.severity==='high').length}处</td><td>整体</td></tr>
                </tbody>
            </table>
            
            <h3>五、安全性评级</h3>
            <p>依据GB 50292-2015，对该建筑进行构件级、子单元级和鉴定单元级安全性评级。</p>
            
            <h4>5.1 构件级评级</h4>
            <table>
                <thead>
                    <tr><th>构件类型</th><th>评分</th><th>等级</th><th>主要问题</th></tr>
                </thead>
                <tbody>
                    ${rating.component.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${c.score}分</td>
                            <td>${c.grade}</td>
                            <td>${c.issue}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h4>5.2 子单元级评级</h4>
            <table>
                <thead>
                    <tr><th>子单元</th><th>评分</th><th>等级</th></tr>
                </thead>
                <tbody>
                    ${rating.subunit.map(s => `
                        <tr><td>${s.name}</td><td>${s.score}分</td><td>${s.grade}</td></tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h4>5.3 鉴定单元评级</h4>
            <p>综合各子单元评级结果，该建筑鉴定单元安全性评级为
            <strong style="font-size:20px;color:${standard.color}">${rating.overallGrade} 级</strong>，
            ${standard.label}。${standard.desc}。</p>
            
            <h3>六、处理建议</h3>
            <p><strong>${standard.action}</strong></p>
            
            ${plan ? `
            <h3>七、改造方案建议</h3>
            <p>针对上述评级结论，建议采取以下改造措施：</p>
            <table>
                <thead>
                    <tr><th>类别</th><th>措施名称</th><th>估算费用</th></tr>
                </thead>
                <tbody>
                    ${plan.measures.map(m => `
                        <tr>
                            <td>${m.target.includes('地基') || m.target.includes('墙') || m.target.includes('梁') || m.target.includes('柱') ? '结构加固' : m.target.includes('屋面') || m.target.includes('外墙') ? '防水翻新' : '管线更新'}</td>
                            <td>${m.name}</td>
                            <td>${m.estimatedCost.toFixed(2)}万元</td>
                        </tr>
                    `).join('')}
                    <tr style="font-weight:bold;background:#fff7e6">
                        <td colspan="2">合计</td>
                        <td>${plan.totalCost.toFixed(2)}万元</td>
                    </tr>
                </tbody>
            </table>
            <p>本次改造总造价约 <strong>${plan.totalCost.toFixed(2)}万元</strong>，
            单方造价约 ${plan.costPerArea} 元/㎡，预计工期 ${plan.totalPeriod} 天。</p>
            ` : ''}
            
            <h3>八、鉴定结论</h3>
            <p>综上所述，该建筑安全性鉴定评级为 <strong>${rating.overallGrade} 级</strong>，
            ${standard.desc}。建议按照上述处理建议和改造方案，尽快采取相应措施，确保建筑使用安全。</p>
            
            <div style="margin-top:48px;text-align:right">
                <p>鉴定单位：____________________</p>
                <p>鉴定人：____________________</p>
                <p>审核人：____________________</p>
                <p>批准人：____________________</p>
                <p style="margin-top:24px">日期：2024年XX月XX日</p>
            </div>
        `;
    },

    getStructureTypeName(type) {
        const map = {
            masonry: '砌体结构',
            concrete: '钢筋混凝土结构',
            steel: '钢结构',
            mixed: '混合结构'
        };
        return map[type] || type;
    }
};
