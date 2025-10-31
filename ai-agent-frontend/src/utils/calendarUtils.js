// 日历工具函数

/**
 * 获取月份名称
 * @param {Date} date - 日期对象
 * @param {string} locale - 语言环境，默认为 'zh-CN'
 * @returns {string} 月份名称
 */
export const getMonthName = (date, locale = 'zh-CN') => {
    return date.toLocaleDateString(locale, { 
        month: 'long', 
        year: 'numeric' 
    });
};

/**
 * 获取星期几的名称
 * @param {string} locale - 语言环境，默认为 'zh-CN'
 * @returns {string[]} 星期名称数组
 */
export const getWeekdayNames = (locale = 'zh-CN') => {
    const weekdays = [];
    const date = new Date(2024, 0, 7); // 2024年1月7日是星期日
    
    for (let i = 0; i < 7; i++) {
        weekdays.push(date.toLocaleDateString(locale, { weekday: 'short' }));
        date.setDate(date.getDate() + 1);
    }
    
    return weekdays;
};

/**
 * 获取月份的第一天
 * @param {Date} date - 日期对象
 * @returns {Date} 月份第一天
 */
export const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * 获取月份的最后一天
 * @param {Date} date - 日期对象
 * @returns {Date} 月份最后一天
 */
export const getLastDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * 获取日历网格的日期数组
 * @param {Date} date - 当前月份日期
 * @returns {Date[]} 日历网格日期数组
 */
export const getCalendarDays = (date) => {
    const firstDay = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return days;
};

/**
 * 检查日期是否是今天
 * @param {Date} date - 要检查的日期
 * @returns {boolean} 是否是今天
 */
export const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

/**
 * 检查日期是否是当前月份
 * @param {Date} date - 要检查的日期
 * @param {Date} currentMonth - 当前月份
 * @returns {boolean} 是否是当前月份
 */
export const isCurrentMonth = (date, currentMonth) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
};

/**
 * 检查日期是否被选中
 * @param {Date} date - 要检查的日期
 * @param {Date} selectedDate - 选中的日期
 * @returns {boolean} 是否被选中
 */
export const isSelected = (date, selectedDate) => {
    return date.toDateString() === selectedDate.toDateString();
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * 格式化时间显示
 * @param {string} time - 时间字符串 (HH:MM)
 * @returns {string} 格式化后的时间
 */
export const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
};

/**
 * 获取某日期的活动
 * @param {Array} events - 活动数组
 * @param {Date} date - 要查询的日期
 * @returns {Array} 该日期的活动数组
 */
export const getEventsForDate = (events, date) => {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });
};

/**
 * 获取上一个月
 * @param {Date} date - 当前日期
 * @returns {Date} 上一个月的日期
 */
export const getPreviousMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() - 1);
};

/**
 * 获取下一个月
 * @param {Date} date - 当前日期
 * @returns {Date} 下一个月的日期
 */
export const getNextMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1);
};

/**
 * 比较两个日期是否相等（只比较年月日）
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @returns {boolean} 是否相等
 */
export const isSameDate = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
};

/**
 * 获取日期的开始时间（00:00:00）
 * @param {Date} date - 日期对象
 * @returns {Date} 开始时间
 */
export const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

/**
 * 获取日期的结束时间（23:59:59）
 * @param {Date} date - 日期对象
 * @returns {Date} 结束时间
 */
export const getEndOfDay = (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

/**
 * 检查日期是否在范围内
 * @param {Date} date - 要检查的日期
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {boolean} 是否在范围内
 */
export const isDateInRange = (date, startDate, endDate) => {
    const start = getStartOfDay(startDate);
    const end = getEndOfDay(endDate);
    return date >= start && date <= end;
};

/**
 * 获取两个日期之间的天数
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {number} 天数差
 */
export const getDaysDifference = (startDate, endDate) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * 添加天数到日期
 * @param {Date} date - 原始日期
 * @param {number} days - 要添加的天数
 * @returns {Date} 新日期
 */
export const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

/**
 * 获取月份的天数
 * @param {Date} date - 日期对象
 * @returns {number} 该月的天数
 */
export const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * 验证日期字符串格式
 * @param {string} dateString - 日期字符串
 * @returns {boolean} 是否有效
 */
export const isValidDateString = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * 获取相对时间描述
 * @param {Date} date - 日期对象
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '今天';
    if (diffInDays === 1) return '明天';
    if (diffInDays === -1) return '昨天';
    if (diffInDays > 1) return `${diffInDays}天后`;
    if (diffInDays < -1) return `${Math.abs(diffInDays)}天前`;
    
    return date.toLocaleDateString('zh-CN');
};
