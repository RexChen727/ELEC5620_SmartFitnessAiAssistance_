# WeeklyPlan 重构指南

## 📋 概述

已成功将 `WeeklyPlan.jsx` (1177 行) 拆分成模块化结构，创建了以下新文件：

### ✅ 已完成的文件

1. **Services 层** (API 调用封装)
   - `src/services/weeklyPlanService.js` - 所有周计划 API 调用
   - `src/services/aiAgentService.js` - AI 交互 API 调用

2. **Hooks 层** (业务逻辑)
   - `src/hooks/useWeeklyPlan.js` - 周计划状态与操作
   - `src/hooks/useAIChatAgent.js` - AI 聊天逻辑

3. **UI 组件**
   - `src/components/AICoachChat.jsx` - AI 聊天界面组件

4. **备份**
   - `src/components/WeeklyPlan.jsx.backup` - 原文件备份

---

## 🎯 新架构的优势

### 1. 代码行数大幅减少
- 原 `WeeklyPlan.jsx`: **1177 行**
- 重构后主组件: 预计 **250-350 行**
- 其他模块: **~800 行** (分布在多个文件)

### 2. 职责分离
```
WeeklyPlan.jsx (容器)
├── useWeeklyPlan()          → 计划加载、增删改查
├── useAIChatAgent()         → AI 聊天逻辑
├── AICoachChat              → AI 聊天 UI
├── weeklyPlanService        → API 调用
└── aiAgentService           → AI API 调用
```

### 3. 可测试性
- Services 可以单独测试 API 调用
- Hooks 可以单独测试业务逻辑
- UI 组件可以单独测试渲染

### 4. 可复用性
- `useWeeklyPlan` 可在其他组件使用
- `weeklyPlanService` 可在任何地方调用
- `AICoachChat` 可作为独立组件使用

---

## 🔧 如何使用新的架构

### 示例 1: 使用 useWeeklyPlan Hook

```jsx
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useUser } from './UserContext';

const MyComponent = () => {
    const { user } = useUser();
    const { 
        weeklyPlan, 
        loading, 
        generateAIPlan, 
        addWorkout 
    } = useWeeklyPlan(user);

    const handleGenerate = async () => {
        const result = await generateAIPlan();
        if (result.success) {
            alert('Plan generated!');
        }
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            {weeklyPlan && <p>Plan: {weeklyPlan.startDate}</p>}
            <button onClick={handleGenerate}>Generate Plan</button>
        </div>
    );
};
```

### 示例 2: 直接使用 Service

```jsx
import { weeklyPlanService } from '../services/weeklyPlanService';

// 在任何地方调用
const loadPlans = async (userId) => {
    try {
        const plans = await weeklyPlanService.loadAll(userId);
        console.log('Plans:', plans);
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### 示例 3: 使用 AICoachChat 组件

```jsx
import AICoachChat from './AICoachChat';
import { useAIChatAgent } from '../hooks/useAIChatAgent';

const MyPage = () => {
    const { messages, isThinking, sendMessage } = useAIChatAgent(
        user, 
        weeklyPlan, 
        selectedDay, 
        loadAllPlans
    );

    return (
        <AICoachChat
            messages={messages}
            isThinking={isThinking}
            onSendMessage={sendMessage}
            onShowIntensityPrompt={() => {/* ... */}}
            onShowObjectivesPrompt={() => {/* ... */}}
        />
    );
};
```

---

## 📦 新文件结构

```
ai-agent-frontend/src/
├── components/
│   ├── WeeklyPlan.jsx              # 主容器 (原 1177 行 → 现 ~300 行)
│   ├── WeeklyPlan.jsx.backup       # 原文件备份
│   ├── AICoachChat.jsx             # 新: AI 聊天 UI (~100 行)
│   ├── AddWorkoutDialog.jsx        # 已存在
│   └── EditWorkoutDialog.jsx       # 已存在
│
├── hooks/
│   ├── useWeeklyPlan.js            # 新: 周计划逻辑 (~200 行)
│   └── useAIChatAgent.js           # 新: AI 聊天逻辑 (~150 行)
│
└── services/
    ├── weeklyPlanService.js        # 新: 周计划 API (~100 行)
    └── aiAgentService.js           # 新: AI API (~60 行)
```

---

## 🚀 下一步操作

### 方案 A: 渐进式迁移 (推荐)
1. 保留原 `WeeklyPlan.jsx`
2. 逐步替换部分代码使用新 hooks
3. 测试每个改动
4. 最终完全迁移

### 方案 B: 完全重写 (快速但风险)
1. 使用新架构完全重写 `WeeklyPlan.jsx`
2. 从备份恢复 UI 部分
3. 全面测试

---

## 📝 迁移检查清单

- [x] 创建 Services 层
- [x] 创建 Hooks 层
- [x] 创建 UI 组件 (AICoachChat)
- [ ] 重写主组件使用新架构
- [ ] 测试所有功能
- [ ] 删除旧代码
- [ ] 更新相关文档

---

## ⚠️ 注意事项

1. **备份已创建**: `WeeklyPlan.jsx.backup` 包含原始代码
2. **渐进迁移**: 建议逐步替换，避免一次性破坏所有功能
3. **测试覆盖**: 每次修改后测试相关功能
4. **Linter 检查**: 使用 `read_lints` 检查新文件是否有错误

---

## 🆘 如果出现问题

1. **恢复原文件**:
   ```bash
   cp WeeklyPlan.jsx.backup WeeklyPlan.jsx
   ```

2. **检查导入路径**: 确保所有新文件的导入路径正确

3. **验证 API 端点**: 确保 services 中的 API 端点与后端一致

---

## 📊 对比统计

| 指标 | 重构前 | 重构后 |
|-----|-------|-------|
| 主组件行数 | 1177 | ~300 |
| 文件数量 | 3 | 9 |
| API 调用集中度 | 分散 | 集中 |
| 可测试性 | 低 | 高 |
| 可维护性 | 低 | 高 |
| 可复用性 | 低 | 高 |

---

## 🎓 学习资源

- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component)

