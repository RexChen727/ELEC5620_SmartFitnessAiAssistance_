# 🍎 苹果日历订阅功能

## 功能概述

AI Agent 智能日历现在支持一键生成苹果日历订阅URL，让用户可以轻松将AI管理的日程同步到苹果设备上。

## ✨ 新增功能

### 1. 导出日历 (.ics文件)
- **功能**：将用户的所有日历事件导出为标准iCalendar格式
- **用途**：可以导入到任何支持.ics格式的日历应用
- **操作**：点击"导出日历"按钮，自动下载.ics文件

### 2. 生成订阅URL
- **功能**：生成一个可订阅的日历URL
- **用途**：苹果设备可以直接订阅，实现实时同步
- **操作**：点击"生成订阅URL"按钮，获取订阅链接

## 📱 苹果设备订阅步骤

### Mac 订阅方法：
1. 打开"日历"应用
2. 点击菜单栏"文件" → "新建日历订阅"
3. 粘贴生成的订阅URL
4. 点击"订阅"完成设置

### iPhone/iPad 订阅方法：
1. 打开"日历"应用
2. 点击底部的"日历"标签
3. 点击"添加日历" → "添加订阅日历"
4. 粘贴生成的订阅URL
5. 点击"添加"完成设置

## 🔧 技术实现

### 后端API端点：
- `GET /api/calendar/export/{userId}` - 导出.ics文件
- `GET /api/calendar/subscribe/{userId}` - 获取订阅URL
- `GET /api/calendar/events?userId={userId}` - 获取用户事件
- `POST /api/calendar/events` - 创建新事件
- `DELETE /api/calendar/events/{eventId}` - 删除事件

### iCalendar格式示例：
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Agent//Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:AI Agent Calendar
X-WR-CALDESC:AI Agent Calendar Export
BEGIN:VEVENT
UID:unique-id@aiagent.com
DTSTAMP:20251017T024500Z
DTSTART:20251017T090000Z
DTEND:20251017T100000Z
SUMMARY:会议标题
DESCRIPTION:会议描述
LOCATION:会议室A
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
```

## 🎯 使用场景

### 1. 个人日程管理
- 在AI Agent中创建和管理日程
- 一键同步到苹果设备
- 实时更新，无需手动导入

### 2. 团队协作
- 分享订阅URL给团队成员
- 团队成员可以订阅查看日程
- 支持多个用户独立管理

### 3. 跨平台同步
- 支持所有支持iCalendar的应用
- 包括Google Calendar、Outlook等
- 确保数据格式兼容性

## 🔄 实时同步

- **自动更新**：当用户在AI Agent中修改日程时，订阅的日历会自动更新
- **即时生效**：更改会在下次同步时反映到苹果设备
- **无需重复操作**：一次订阅，持续同步

## 📋 注意事项

1. **网络要求**：订阅功能需要设备能够访问AI Agent服务器
2. **权限设置**：确保用户有访问日历的权限
3. **数据安全**：订阅URL包含用户ID，请妥善保管
4. **服务器状态**：服务器离线时无法同步更新

## 🚀 未来扩展

- **智能提醒**：AI可以根据事件重要性设置提醒
- **自动安排**：AI可以自动安排最佳会议时间
- **冲突检测**：智能检测日程冲突并提供解决方案
- **自然语言**：支持自然语言创建和修改事件

---

*这个功能让AI Agent的智能日历真正实现了跨平台、实时同步的现代化日程管理体验！* 🎉
