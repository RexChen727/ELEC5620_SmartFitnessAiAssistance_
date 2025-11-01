# AI 周期训练计划功能说明

## 功能概述

系统现在支持 AI 自动生成周期训练计划,并且会参考用户档案(年龄、性别、身高、体重)进行个性化定制。

## 主要特性

### 1. **AI 智能周计划生成**
- 自动为每周7天生成训练计划
- 每天包含:
  - **肌群标题** (muscleGroup): Chest, Back, Legs, Shoulders, Arms, Core, Cardio, Full Body, Rest
  - **详细动作列表**: 每个动作包含名称、组数、次数、重量、时长、备注

### 2. **用户档案参考**
AI 在生成计划时会考虑:
- **性别**: 调整动作选择和强度
- **年龄**: 影响训练强度和恢复建议
- **身高/体重**: 用于评估体能基础
- **聊天历史**: 上下文记忆你的偏好

### 3. **前端显示增强**
- 每日卡片显示对应的肌群标题
- 可通过下拉框手动修改肌群标签
- Rest 日显示灰色文本,训练日显示紫色

### 4. **聊天指令创建周期**
在 Weekly Plan 页面的 AI Coach 聊天框中,说以下任意指令:
- "创建周期"
- "生成周计划"
- "帮我安排一周训练"
- "更新周期"
- "create weekly plan"

AI 会自动识别意图并调用 `/api/weekly-plan/generate` 生成全新计划。

## 后端实现

### 数据库变更
新增字段 `weekly_plan_workouts.muscle_group`:
```sql
ALTER TABLE weekly_plan_workouts 
ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(100);
```
运行迁移脚本:
```bash
psql -U postgres -f add_muscle_group_column.sql
```

### AI 提示词增强
`WeeklyPlanService.buildWeeklyPlanPrompt()` 现在包含:
1. **用户档案上下文**: 性别、年龄、身高、体重
2. **器械知识库**: 可用器械及其锻炼的肌群
3. **JSON 结构要求**: 
```json
[
  {
    "day": "Monday",
    "muscleGroup": "Chest",
    "workouts": [
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 8,
        "weight": "135 lbs",
        "duration": "45 min",
        "notes": "Focus on form"
      }
    ]
  },
  {
    "day": "Tuesday",
    "muscleGroup": "Rest",
    "workouts": []
  }
]
```

### API 端点
- **POST** `/api/weekly-plan/generate?userId={userId}`
  - 生成或覆盖当前周的训练计划
  - 返回包含 `muscleGroupsByDay` 的完整计划

- **GET** `/api/weekly-plan/all?userId={userId}`
  - 返回所有历史计划
  - 每个计划包含 `muscleGroupsByDay` 字段

## 前端实现

### WeeklyPlan.jsx 增强

#### 1. 聊天意图识别
`handleSendMessage()` 的 AI 提示词更新:
```javascript
IMPORTANT: If user says things like "创建周期", "生成周计划", "帮我安排一周训练", "更新周期", "create weekly plan", map it to action "create_weekly_plan".
```

#### 2. 创建周期操作
```javascript
case 'create_weekly_plan':
    const genResponse = await axios.post('/api/weekly-plan/generate', null, {
        params: { userId: user.id }
    });
    await loadAllPlans(); // 重新加载所有计划
    // 显示成功消息
```

#### 3. 每日标题下拉框
```jsx
<select value={dayTitlesByDay[index] || 'Rest'} onChange={handleTitleChange}>
  <option value="Rest">Rest</option>
  <option value="Chest">Chest</option>
  <option value="Back">Back</option>
  <option value="Legs">Legs</option>
  <option value="Shoulders">Shoulders</option>
  <option value="Arms">Arms</option>
  <option value="Core">Core</option>
  <option value="Full Body">Full Body</option>
  <option value="Cardio">Cardio</option>
</select>
```

## 使用流程

### 场景 1: 新用户首次创建周期
1. 登录系统
2. 进入 **Weekly Plan** 页面
3. 在右侧 **AI Fitness Coach** 聊天框输入: `"创建周期"`
4. 系统自动生成本周计划(周一到周日)
5. 每天显示对应的肌群标题和训练动作

### 场景 2: 更新已有周期
1. 在聊天框输入: `"更新周期"` 或 `"生成新的周计划"`
2. 系统会删除当前周的旧计划,生成全新计划
3. 保留其他周的历史计划

### 场景 3: 手动修改肌群标签
1. 点击某一天的卡片(选中该天)
2. 卡片中显示下拉框
3. 选择新的肌群标签(如 Chest → Legs)
4. *(未来可增加保存到后端的功能)*

## 注意事项

1. **数据库迁移**: 如果是从旧版本升级,务必运行 `add_muscle_group_column.sql` 添加新字段
2. **Gemini API**: 确保 `application.properties` 中配置了正确的 Gemini API Key
3. **UserProfile**: 建议用户先填写个人档案(年龄/性别/身高/体重),AI 会生成更精准的计划
4. **并发冲突**: 同一用户同一时间只能有一个当前周计划,新生成会覆盖旧计划

## 下一步优化建议

- [ ] 支持自定义周期长度(2周、4周、8周训练计划)
- [ ] 持久化前端手动修改的 `dayTitlesByDay` 到后端
- [ ] 提供"计划模板"功能(增肌、减脂、塑形、康复)
- [ ] 集成 Apple Health / Google Fit 自动同步体重变化
- [ ] 多语言支持(中英文 UI 切换)

