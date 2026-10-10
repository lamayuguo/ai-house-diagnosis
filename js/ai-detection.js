/**
 * AI病害识别模块
 * 当前为模拟实现，预留真实AI模型接口
 * 可扩展：接入YOLOv8/U-Net等模型的API
 */

const AIDetection = {
    // 模拟病害识别（实际项目中替换为AI模型推理）
    async detect(imageData) {
        // 模拟AI推理过程
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 实际项目中此处应调用AI模型API
        // const response = await fetch('/api/detect', { method: 'POST', body: imageData });
        // return await response.json();
        
        // 模拟识别结果
        return {
            success: true,
            results: this.generateMockResults()
        };
    },

    // 生成模拟识别结果
    generateMockResults() {
        return {
            crack: DemoDefects.crack,
            leak: DemoDefects.leak,
            corrosion: DemoDefects.corrosion,
            deformation: DemoDefects.deformation
        };
    },

    // 加载演示识别结果
    loadDemoResults() {
        AppState.detectionResults = {
            crack: [...DemoDefects.crack],
            leak: [...DemoDefects.leak],
            corrosion: [...DemoDefects.corrosion],
            deformation: [...DemoDefects.deformation]
        };
        return AppState.detectionResults;
    },

    // 计算统计数据
    getStats() {
        const results = AppState.detectionResults;
        const allDefects = [
            ...results.crack,
            ...results.leak,
            ...results.corrosion,
            ...results.deformation
        ];
        
        const seriousCount = allDefects.filter(d => d.severity === 'high').length;
        const avgConfidence = allDefects.length > 0
            ? Math.round(allDefects.reduce((sum, d) => sum + d.confidence, 0) / allDefects.length)
            : 0;
        
        return {
            totalImages: 8, // 模拟影像数量
            totalDefects: allDefects.length,
            seriousDefects: seriousCount,
            avgConfidence: avgConfidence
        };
    },

    // 病害严重程度标签
    getSeverityLabel(severity) {
        const map = {
            high: '严重',
            medium: '中等',
            low: '轻微'
        };
        return map[severity] || '未知';
    },

    // 渲染病害卡片
    renderDefectCard(defect, type) {
        const typeConfig = DefectTypes[type];
        const severityClass = `severity-${defect.severity}`;
        const severityLabel = this.getSeverityLabel(defect.severity);
        
        let metaHtml = '';
        if (type === 'crack') {
            metaHtml = `
                <div>位置：<span>${defect.location}</span></div>
                <div>宽度：<span>${defect.width} mm</span></div>
                <div>长度：<span>${defect.length} mm</span></div>
                <div>走向：<span>${defect.direction}</span></div>
            `;
        } else if (type === 'leak' || type === 'corrosion') {
            metaHtml = `
                <div>位置：<span>${defect.location}</span></div>
                <div>面积：<span>${defect.area} ㎡</span></div>
            `;
        } else if (type === 'deformation') {
            metaHtml = `
                <div>位置：<span>${defect.location}</span></div>
                <div>沉降量：<span>${defect.settlement} mm</span></div>
                <div>倾斜率：<span>${defect.tilt}</span></div>
            `;
        }
        
        return `
            <div class="defect-card">
                <div class="defect-image" style="background: ${typeConfig.bgColor}">
                    <span>${typeConfig.icon}</span>
                    <span class="confidence">置信度 ${defect.confidence}%</span>
                    <span class="severity ${severityClass}">${severityLabel}</span>
                </div>
                <div class="defect-info">
                    <h5>${typeConfig.name} - ${defect.id}</h5>
                    <div class="defect-meta">${metaHtml}</div>
                    <div class="defect-meta" style="margin-top:6px;color:#666">${defect.desc}</div>
                </div>
            </div>
        `;
    }
};
