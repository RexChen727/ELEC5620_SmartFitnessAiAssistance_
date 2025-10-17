import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Download, Share2, Copy } from 'lucide-react';
import { useUser } from './UserContext';
import './calendar.css';

const Calendar = () => {
    const { user } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [subscribeUrl, setSubscribeUrl] = useState('');
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
    });

    // 调试信息
    console.log('Calendar component rendered, user:', user);

    // 从后端加载用户事件
    const loadUserEvents = async () => {
        try {
            if (!user) return;

            const response = await fetch(`/api/calendar/events?userId=${user.id}`);
            if (response.ok) {
                const userEvents = await response.json();
                setEvents(userEvents);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    // 组件加载时获取用户事件
    useEffect(() => {
        loadUserEvents();
    }, [user]);

    // 获取月份名称
    const getMonthName = (date) => {
        return date.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' });
    };

    // 获取星期几的名称
    const getWeekdayNames = () => {
        return ['日', '一', '二', '三', '四', '五', '六'];
    };

    // 获取月份的第一天
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // 获取月份的最后一天
    const getLastDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    // 获取日历网格的日期数组
    const getCalendarDays = () => {
        const firstDay = getFirstDayOfMonth(currentDate);
        const lastDay = getLastDayOfMonth(currentDate);
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

    // 检查日期是否是今天
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // 检查日期是否是当前月份
    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    // 检查日期是否被选中
    const isSelected = (date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    // 获取某日期的活动
    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    // 上一个月
    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    // 下一个月
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    // 选择日期
    const selectDate = (date) => {
        setSelectedDate(date);
        setShowEventForm(false);
    };

    // 添加活动
    const addEvent = async () => {
        console.log('addEvent called, user:', user);
        console.log('newEvent:', newEvent);
        
        if (newEvent.title && newEvent.date) {
            try {
                if (!user) {
                    console.log('No user found, showing login alert');
                    alert('请先登录');
                    return;
                }

                // 创建事件数据
                const eventData = {
                    title: newEvent.title,
                    description: newEvent.description || '',
                    startTime: new Date(newEvent.date + (newEvent.time ? 'T' + newEvent.time : 'T09:00')).toISOString(),
                    endTime: new Date(newEvent.date + (newEvent.time ? 'T' + newEvent.time : 'T09:00')).toISOString(),
                    location: newEvent.location || '',
                    user: { id: user.id }
                };

                console.log('Sending event data:', eventData);

                const response = await fetch('/api/calendar/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData),
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    const savedEvent = await response.json();
                    console.log('Event saved successfully:', savedEvent);
                    setEvents([...events, savedEvent]);
                    setNewEvent({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: ''
                    });
                    setShowEventForm(false);
                    alert('活动添加成功！');
                } else {
                    const errorText = await response.text();
                    console.error('Add event failed:', response.status, errorText);
                    alert('添加活动失败，请重试');
                }
            } catch (error) {
                console.error('Error adding event:', error);
                alert('添加活动时出错');
            }
        } else {
            console.log('Missing required fields:', { title: newEvent.title, date: newEvent.date });
            alert('请填写活动标题和日期');
        }
    };

    // 删除活动
    const deleteEvent = async (eventId) => {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setEvents(events.filter(event => event.id !== eventId));
                alert('活动删除成功！');
            } else {
                alert('删除活动失败，请重试');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('删除活动时出错');
        }
    };

    // 格式化日期为YYYY-MM-DD
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };

    // 格式化时间显示
    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };

    // 生成订阅URL
    const generateSubscribeUrl = async () => {
        try {
            if (!user) {
                alert('请先登录');
                return;
            }

            const response = await fetch(`/api/calendar/subscribe/${user.id}`);
            if (response.ok) {
                const url = await response.text();
                setSubscribeUrl(url);
                setShowSubscribeModal(true);
            } else {
                alert('生成订阅URL失败');
            }
        } catch (error) {
            console.error('Error generating subscribe URL:', error);
            alert('生成订阅URL时出错');
        }
    };

    // 导出日历
    const exportCalendar = async () => {
        try {
            if (!user) {
                alert('请先登录');
                return;
            }

            const response = await fetch(`/api/calendar/export/${user.id}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ai-agent-calendar.ics';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('导出日历失败');
            }
        } catch (error) {
            console.error('Error exporting calendar:', error);
            alert('导出日历时出错');
        }
    };

    // 复制订阅URL到剪贴板
    const copySubscribeUrl = async () => {
        try {
            await navigator.clipboard.writeText(subscribeUrl);
            alert('订阅URL已复制到剪贴板！');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('复制失败，请手动复制');
        }
    };

    const calendarDays = getCalendarDays();
    const selectedDateEvents = getEventsForDate(selectedDate);

    return (
        <div className="calendar-container">
            {/* 日历头部 */}
            <div className="calendar-header">
                <div className="calendar-title">
                    <CalendarIcon size={24} />
                    <h2>AI 智能日历</h2>
                </div>
                <div className="calendar-actions">
                    <button onClick={exportCalendar} className="action-button export-btn">
                        <Download size={16} />
                        导出日历
                    </button>
                    <button onClick={generateSubscribeUrl} className="action-button subscribe-btn">
                        <Share2 size={16} />
                        生成订阅URL
                    </button>
                </div>
                <div className="calendar-navigation">
                    <button onClick={previousMonth} className="nav-button">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="month-year">{getMonthName(currentDate)}</h3>
                    <button onClick={nextMonth} className="nav-button">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="calendar-content">
                {/* 日历网格 */}
                <div className="calendar-grid">
                    {/* 星期标题 */}
                    <div className="weekday-header">
                        {getWeekdayNames().map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>

                    {/* 日期网格 */}
                    <div className="days-grid">
                        {calendarDays.map((date, index) => {
                            const dayEvents = getEventsForDate(date);
                            return (
                                <div
                                    key={index}
                                    className={`day-cell ${!isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                                    onClick={() => selectDate(date)}
                                >
                                    <span className="day-number">{date.getDate()}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="events-indicator">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div key={event.id} className="event-dot" title={event.title}></div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="more-events">+{dayEvents.length - 3}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 侧边栏 - 选中日期的活动 */}
                <div className="calendar-sidebar">
                    <div className="selected-date-info">
                        <h3>{selectedDate.toLocaleDateString('zh-CN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'long'
                        })}</h3>
                        <button 
                            className="add-event-btn"
                            onClick={() => {
                                // 初始化表单数据，确保日期格式正确
                                setNewEvent({
                                    title: '',
                                    description: '',
                                    date: formatDateForInput(selectedDate),
                                    time: '',
                                    location: ''
                                });
                                setShowEventForm(true);
                            }}
                        >
                            <Plus size={16} />
                            添加活动
                        </button>
                    </div>

                    {/* 活动列表 */}
                    <div className="events-list">
                        {selectedDateEvents.length === 0 ? (
                            <p className="no-events">今天没有活动</p>
                        ) : (
                            selectedDateEvents.map(event => (
                                <div key={event.id} className="event-item">
                                    <div className="event-header">
                                        <h4 className="event-title">{event.title}</h4>
                                        <button 
                                            className="delete-event-btn"
                                            onClick={() => deleteEvent(event.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {event.startTime && (
                                        <div className="event-time">
                                            <Clock size={14} />
                                            {new Date(event.startTime).toLocaleTimeString('zh-CN', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="event-location">
                                            <MapPin size={14} />
                                            {event.location}
                                        </div>
                                    )}
                                    {event.description && (
                                        <p className="event-description">{event.description}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 添加活动表单 */}
            {showEventForm && (
                <div className="event-form-overlay">
                    <div className="event-form">
                        <h3>添加新活动</h3>
                        <form onSubmit={(e) => { e.preventDefault(); addEvent(); }}>
                            <div className="form-group">
                                <label>活动标题 *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>日期 *</label>
                                <input
                                    type="date"
                                    value={newEvent.date || formatDateForInput(selectedDate)}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>时间</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>地点</label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>描述</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEventForm(false)}>
                                    取消
                                </button>
                                <button type="submit" className="primary">
                                    添加活动
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 订阅URL模态框 */}
            {showSubscribeModal && (
                <div className="event-form-overlay">
                    <div className="event-form">
                        <h3>📅 苹果日历订阅</h3>
                        <div className="subscribe-content">
                            <p className="subscribe-description">
                                使用以下URL在苹果设备上订阅你的AI智能日历：
                            </p>
                            <div className="url-container">
                                <input
                                    type="text"
                                    value={subscribeUrl}
                                    readOnly
                                    className="url-input"
                                />
                                <button onClick={copySubscribeUrl} className="copy-btn">
                                    <Copy size={16} />
                                    复制
                                </button>
                            </div>
                            <div className="subscribe-instructions">
                                <h4>📱 订阅步骤：</h4>
                                <ol>
                                    <li>复制上面的URL</li>
                                    <li>在Mac上：打开"日历"应用 → 文件 → 新建日历订阅 → 粘贴URL</li>
                                    <li>在iPhone/iPad上：打开"日历"应用 → 日历 → 添加日历 → 添加订阅日历 → 粘贴URL</li>
                                    <li>点击"订阅"完成设置</li>
                                </ol>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setShowSubscribeModal(false)} className="primary">
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
