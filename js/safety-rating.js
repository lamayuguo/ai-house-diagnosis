/**
 * 安全性评级引擎
 * 依据 GB 50292-2015《民用建筑可靠性鉴定标准》
 * 评级层次：构件级 → 子单元级 → 鉴定单元级
 */

const SafetyRating = {
    // 执行评级
    evaluate() {
        const defects = AppState.detectionResults;
        
        // 1. 构件级评级
        const componentRating = this.evaluateComponents(defects);
        
        // 2. 子单元评级
        const subunitRating = this.evaluateSubunits(componentRating, defects);
        
        // 3. 鉴定单元评级
        const unitRating = this.evaluateUnit(subunitRating);
        
        const result = {
            component: componentRating,
            subunit: subunitRating,
            unit: unitRating,
            overallGrade: unitRating.grade,
            overallScore: unitRating.score
        };
        
        AppState.ratingResult = result;
        return result;
    },

    // 构件级评级
    evaluateComponents(defects) {
        const components = [];
        
        // 承重墙体评级
        const wallCracks = defects.crack.filter(d => d.location.includes('墙'));
        const wallScore = this.calcComponentScore(wallCracks, 'wall');
        components.push({
            name: '承重墙体',
            score: wallScore,
            grade: scoreToGrade(wallScore),
            issue: wallCracks.length > 0 ? `发现${wallCracks.length}处裂缝` : '未发现明显病害'
        });
        
        // 梁评级
        const beamCracks = defects.crack.filter(d => d.location.includes('梁'));
        const beamScore = this.calcComponentScore(beamCracks, 'beam');
        components.push({
            name: '梁',
            score: beamScore,
            grade: scoreToGrade(beamScore),
            issue: beamCracks.length > 0 ? `发现${beamCracks.length}处裂缝` : '未发现明显病害'
        });
        
        // 板评级
        const slabCracks = defects.crack.filter(d => d.location.includes('楼板') || d.location.includes('板'));
        const slabScore = this.calcComponentScore(slabCracks, 'slab');
        components.push({
            name: '楼板',
            score: slabScore,
            grade: scoreToGrade(slabScore),
            issue: slabCracks.length > 0 ? `发现${slabCracks.length}处裂缝` : '未发现明显病害'
        });
        
        // 柱评级
        const columnCorrosion = defects.corrosion.filter(d => d.location.includes('柱'));
        const columnScore = this.calcComponentScore(columnCorrosion, 'column');
        components.push({
            name: '柱',
            score: columnScore,
            grade: scoreToGrade(columnScore),
            issue: columnCorrosion.length > 0 ? `发现${columnCorrosion.length}处锈蚀` : '未发现明显病害'
        });
        
        // 屋面评级
        const roofLeak = defects.leak.filter(d => d.location.includes('屋面'));
        const roofScore = roofLeak.length > 0 ? 65 : 92;
        components.push({
            name: '屋面',
            score: roofScore,
            grade: scoreToGrade(roofScore),
            issue: roofLeak.length > 0 ? `发现${roofLeak.length}处渗漏` : '防水层完好'
        });
        
        // 地基基础评级
        const deform = defects.deformation;
        const foundationScore = this.calcFoundationScore(deform);
        components.push({
            name: '地基基础',
            score: foundationScore,
            grade: scoreToGrade(foundationScore),
            issue: deform.length > 0 && deform[0].settlement > 10 ? `不均匀沉降${deform[0].settlement}mm` : '沉降在允许范围内'
        });
        
        return components;
    },

    // 计算构件评分
    calcComponentScore(defects, type) {
        let baseScore = 95;
        
        defects.forEach(d => {
            // 根据严重程度扣分
            if (d.severity === 'high') {
                baseScore -= 15;
                // 裂缝宽度越大扣分越多
                if (d.width && d.width > 0.5) baseScore -= 10;
            } else if (d.severity === 'medium') {
                baseScore -= 8;
            } else {
                baseScore -= 3;
            }
        });
        
        // 病害数量扣分
        baseScore -= Math.max(0, defects.length - 1) * 2;
        
        return Math.max(40, Math.min(100, baseScore));
    },

    // 计算地基基础评分
    calcFoundationScore(deformations) {
        if (deformations.length === 0) return 92;
        
        const d = deformations[0];
        let score = 95;
        
        // 沉降量扣分 (mm)
        if (d.settlement > 30) score -= 40;
        else if (d.settlement > 20) score -= 25;
        else if (d.settlement > 10) score -= 15;
        else if (d.settlement > 5) score -= 5;
        
        // 倾斜率扣分
        if (d.tilt > 0.004) score -= 20;
        else if (d.tilt > 0.002) score -= 10;
        
        return Math.max(40, Math.min(100, score));
    },

    // 子单元评级
    evaluateSubunits(components, defects) {
        const subunits = [];
        
        // 地基基础子单元
        const foundation = components.find(c => c.name === '地基基础');
        subunits.push({
            name: '地基基础',
            score: foundation.score,
            grade: foundation.grade
        });
        
        // 上部承重结构子单元
        const structureComponents = components.filter(c => 
            ['承重墙体', '梁', '楼板', '柱'].includes(c.name)
        );
        const structureScore = Math.round(
            structureComponents.reduce((sum, c) => sum + c.score, 0) / structureComponents.length
        );
        subunits.push({
            name: '上部承重结构',
            score: structureScore,
            grade: scoreToGrade(structureScore)
        });
        
        // 围护系统子单元
        const enclosureComponents = components.filter(c => c.name === '屋面');
        const enclosureScore = enclosureComponents.length > 0
            ? Math.round(enclosureComponents.reduce((sum, c) => sum + c.score, 0) / enclosureComponents.length)
            : 90;
        subunits.push({
            name: '围护系统',
            score: enclosureScore,
            grade: scoreToGrade(enclosureScore)
        });
        
        return subunits;
    },

    // 鉴定单元评级
    evaluateUnit(subunits) {
        // 取各子单元最低分作为主要控制因素，辅以加权平均
        const scores = subunits.map(s => s.score);
        const minScore = Math.min(...scores);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        // 鉴定单元评分：以最低分为主，平均值为辅
        const finalScore = Math.round(minScore * 0.6 + avgScore * 0.4);
        
        return {
            name: '鉴定单元',
            score: finalScore,
            grade: scoreToGrade(finalScore),
            minGrade: scoreToGrade(minScore),
            avgGrade: scoreToGrade(avgScore)
        };
    },

    // 获取评级建议
    getRecommendation(grade) {
        return SafetyRatingStandard[grade];
    },

    // 渲染评级结果
    renderResult(result) {
        const overallGrade = result.overallGrade;
        const standard = this.getRecommendation(overallGrade);
        
        // 评级徽章
        const badge = document.getElementById('ratingBadge');
        badge.className = 'rating-badge grade-' + overallGrade;
        document.getElementById('ratingGrade').textContent = overallGrade + '级';
        document.getElementById('ratingLabel').textContent = standard.label;
        
        // 评级描述
        document.getElementById('ratingDesc').innerHTML = `
            <strong>评级结论：</strong>${standard.label}<br>
            <strong>详细说明：</strong>${standard.desc}<br>
            <strong>处理建议：</strong><span style="color:${standard.color};font-weight:600">${standard.action}</span><br>
            <strong>鉴定单元评分：</strong>${result.overallScore} 分
        `;
        
        // 构件级评级
        const componentHtml = result.component.map(c => `
            <div class="rating-row">
                <span>${c.name}</span>
                <span class="grade-tag grade-${c.grade}">${c.grade} (${c.score}分)</span>
            </div>
        `).join('');
        document.getElementById('componentRating').innerHTML = componentHtml;
        
        // 子单元评级
        const subunitHtml = result.subunit.map(s => `
            <div class="rating-row">
                <span>${s.name}</span>
                <span class="grade-tag grade-${s.grade}">${s.grade} (${s.score}分)</span>
            </div>
        `).join('');
        document.getElementById('subunitRating').innerHTML = subunitHtml;
        
        // 鉴定单元评级
        document.getElementById('unitRating').innerHTML = `
            <div class="rating-row">
                <span>综合评级</span>
                <span class="grade-tag grade-${result.unit.grade}">${result.unit.grade} (${result.unit.score}分)</span>
            </div>
        `;
    }
};
