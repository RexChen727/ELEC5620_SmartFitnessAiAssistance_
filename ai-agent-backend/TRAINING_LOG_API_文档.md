# Training Log API 文档

## 概述

本文档说明如何使用 Training Log API 获取训练数据，用于 Monthly Report 等功能的数据展示。

**Base URL**: `http://localhost:8080/api/training-log`

---

## 📋 数据字段说明

### TrainingLog 对象

```json
{
  "id": 1,
  "user": { "id": 1 },
  "workoutDate": "2024-12-15",
  "exerciseName": "Bench Press",
  "sets": 3,
  "reps": 10,
  "weight": 135.00,
  "weightUnit": "lbs",
  "restSeconds": 60,
  "durationMinutes": 45,
  "caloriesBurned": 180,
  "difficultyRating": 7,
  "notes": "Felt strong today",
  "createdAt": "2024-12-15T10:30:00",
  "updatedAt": "2024-12-15T10:30:00"
}
```

**字段说明**:
- `id`: 训练日志ID
- `user`: 用户信息（通常只需要 `user.id`）
- `workoutDate`: 训练日期（YYYY-MM-DD格式）
- `exerciseName`: 运动名称
- `sets`: 组数
- `reps`: 每组次数
- `weight`: 重量
- `weightUnit`: 重量单位（lbs/kg）
- `restSeconds`: 休息时间（秒）
- `durationMinutes`: 持续时间（分钟）
- `caloriesBurned`: 消耗卡路里
- `difficultyRating`: 难度评分（1-10）
- `notes`: 备注

---

## 🎯 API端点

### 1. 获取用户某月的所有训练日志

**最常用 - 用于Monthly Report**

```http
GET /api/training-log/user/{userId}/range?startDate={startDate}&endDate={endDate}
```

**参数**:
- `userId` (路径参数): 用户ID
- `startDate` (查询参数): 开始日期 (YYYY-MM-DD)
- `endDate` (查询参数): 结束日期 (YYYY-MM-DD)

**示例请求**:
```bash
curl "http://localhost:8080/api/training-log/user/1/range?startDate=2024-12-01&endDate=2024-12-31"
```

**示例响应**:
```json
[
  {
    "id": 1,
    "workoutDate": "2024-12-01",
    "exerciseName": "Squats",
    "sets": 4,
    "reps": 12,
    "weight": 185.00,
    "weightUnit": "lbs",
    "durationMinutes": 45,
    "caloriesBurned": 200
  },
  {
    "id": 2,
    "workoutDate": "2024-12-01",
    "exerciseName": "Bench Press",
    "sets": 3,
    "reps": 10,
    "weight": 135.00,
    "durationMinutes": 40,
    "caloriesBurned": 180
  }
]
```

---

### 2. 获取用户所有训练日志

```http
GET /api/training-log/user/{userId}
```

**示例请求**:
```bash
curl "http://localhost:8080/api/training-log/user/1"
```

**返回**: 按日期降序排列的所有训练日志

---

### 3. 获取用户基本统计

```http
GET /api/training-log/user/{userId}/stats
```

**示例请求**:
```bash
curl "http://localhost:8080/api/training-log/user/1/stats"
```

**示例响应**:
```json
{
  "totalWorkouts": 24
}
```

---

## 📊 Monthly Report 数据计算示例

### JavaScript/React 示例

```javascript
// 获取当月训练数据
const fetchMonthlyReport = async (userId, year, month) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const response = await fetch(
    `/api/training-log/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`
  );
  const logs = await response.json();
  
  // 计算统计数据
  const stats = {
    // 总训练次数
    totalWorkouts: logs.length,
    
    // 总时长（分钟）
    totalMinutes: logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0),
    
    // 总卡路里
    totalCalories: logs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
    
    // 独特的训练天数
    uniqueWorkoutDays: new Set(logs.map(log => log.workoutDate)).size,
  };
  
  // 统计每个运动的次数
  const exerciseCounts = {};
  logs.forEach(log => {
    exerciseCounts[log.exerciseName] = (exerciseCounts[log.exerciseName] || 0) + 1;
  });
  
  // Top Exercises（排序）
  const topExercises = Object.entries(exerciseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 按周分组数据
  const weeklyActivity = calculateWeeklyActivity(logs);
  
  return { stats, topExercises, weeklyActivity };
};

// 按周分组
const calculateWeeklyActivity = (logs) => {
  const weekly = {};
  logs.forEach(log => {
    const date = new Date(log.workoutDate);
    const weekStart = getWeekStart(date);
    const weekKey = `${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
    
    if (!weekly[weekKey]) {
      weekly[weekKey] = { workouts: 0, minutes: 0 };
    }
    weekly[weekKey].workouts++;
    weekly[weekKey].minutes += (log.durationMinutes || 0);
  });
  
  return Object.entries(weekly).map(([week, data]) => ({
    week,
    workouts: data.workouts,
    minutes: data.minutes
  }));
};

// 获取周的开始日期
const getWeekStart = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};
```

---

## 🎨 完整使用示例

### React 组件示例

```jsx
import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';

const MonthlyReport = () => {
  const { user } = useUser();
  const [reportData, setReportData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const year = 2024;
      const month = 12;
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      try {
        const response = await fetch(
          `/api/training-log/user/${user.id}/range?startDate=${startDate}&endDate=${endDate}`
        );
        
        if (response.ok) {
          const logs = await response.json();
          
          // 计算统计数据
          const stats = {
            totalWorkouts: logs.length,
            totalMinutes: logs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0),
            totalCalories: logs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
            uniqueWorkoutDays: new Set(logs.map(log => log.workoutDate)).size,
          };
          
          // Top Exercises
          const exerciseCounts = {};
          logs.forEach(log => {
            exerciseCounts[log.exerciseName] = 
              (exerciseCounts[log.exerciseName] || 0) + 1;
          });
          
          const topExercises = Object.entries(exerciseCounts)
            .map(([name, count]) => ({ 
              name, 
              count,
              percentage: (count / logs.length * 100).toFixed(0)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          setReportData({ stats, topExercises });
        }
      } catch (error) {
        console.error('Error loading monthly report:', error);
      }
    };
    
    loadData();
  }, [user]);
  
  if (!reportData) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Monthly Report</h2>
      
      <div>
        <p>Total Workouts: {reportData.stats.totalWorkouts}</p>
        <p>Total Minutes: {reportData.stats.totalMinutes}</p>
        <p>Total Calories: {reportData.stats.totalCalories}</p>
        <p>Workout Days: {reportData.stats.uniqueWorkoutDays}</p>
      </div>
      
      <div>
        <h3>Top Exercises</h3>
        {reportData.topExercises.map((ex, i) => (
          <div key={i}>
            {ex.name}: {ex.count} times ({ex.percentage}%)
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyReport;
```

---

## 🔍 Swagger API 文档

启动后端服务后，访问以下地址查看完整的交互式API文档：

**Swagger UI**: http://localhost:8080/swagger-ui.html

在页面中找到 **"Training Log Controller"** 部分，可以看到：
- 所有API端点的详细说明
- 请求/响应示例
- 可以直接测试API

---

## 📝 注意事项

### 日期格式
所有日期使用 `YYYY-MM-DD` 格式，例如：`2024-12-01`

### 用户认证
当前实现中，API 需要 `userId` 作为参数。确保前端在调用时传入正确的用户ID。

### 空值处理
某些字段可能为 `null`，前端需要做好空值检查：
```javascript
const duration = log.durationMinutes || 0;  // 如果为null，使用0
```

### 时区
API 返回的日期使用服务器时区。确保前端正确处理时区转换。

---

## 🛠️ 测试API

### 使用 curl

```bash
# 获取12月份的所有训练数据
curl "http://localhost:8080/api/training-log/user/1/range?startDate=2024-12-01&endDate=2024-12-31"

# 获取用户基本统计
curl "http://localhost:8080/api/training-log/user/1/stats"
```

### 使用 Postman 或浏览器

1. 确保后端服务正在运行
2. 在浏览器或Postman中访问上述URL
3. 替换 `{userId}` 为实际的用户ID

---

## 📊 数据计算参考

### 常用统计指标

| 指标 | 计算方法 |
|------|----------|
| 总训练次数 | `logs.length` |
| 总时长 | 所有 `durationMinutes` 相加 |
| 总卡路里 | 所有 `caloriesBurned` 相加 |
| 训练天数 | 去重后的 `workoutDate` 数量 |
| 平均每次时长 | `totalMinutes / totalWorkouts` |
| 训练频率 | `uniqueWorkoutDays / 当月天数` |
| Top Exercises | 按 `exerciseName` 分组统计 |
| 周活动数据 | 按周分组统计每周训练次数和时长 |

### 连续天数计算

```javascript
const calculateStreak = (logs) => {
  const dates = [...new Set(logs.map(log => log.workoutDate))]
    .sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of dates) {
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};
```

---

## 🔗 相关资源

- **Training Log 页面**: `/training-log` 路由
- **Swagger 文档**: http://localhost:8080/swagger-ui.html
- **后端 Controller**: `TrainingLogController.java`
- **数据库表**: `training_logs`

---

## 💡 提示

如果需要在后端做更复杂的聚合统计（比如月度聚合API），可以告诉我，我可以添加类似这样的接口：

```http
GET /api/training-log/user/{userId}/monthly-stats?year=2024&month=12
```

返回：
```json
{
  "year": 2024,
  "month": 12,
  "totalWorkouts": 24,
  "totalMinutes": 1080,
  "totalCalories": 4320,
  "uniqueWorkoutDays": 18,
  "averageWorkoutDuration": 45,
  "topExercises": [...]
}
```

但目前现有的API已经足够前端自己计算这些数据了！

---

**有问题随时联系！** 🚀

