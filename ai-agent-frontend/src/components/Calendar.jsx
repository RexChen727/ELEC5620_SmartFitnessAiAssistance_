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
    const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
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

    // Get month name
    const getMonthName = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Get weekday names
    const getWeekdayNames = () => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

    // 视图切换导航函数
    const previousPeriod = () => {
        if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
        } else if (viewMode === 'week') {
            setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        }
    };

    const nextPeriod = () => {
        if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        } else if (viewMode === 'week') {
            setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        }
    };

    // 选择日期
    const selectDate = (date) => {
        setSelectedDate(date);
        setShowEventForm(false);
    };

    // Add Event
    const addEvent = async () => {
        console.log('addEvent called, user:', user);
        console.log('newEvent:', newEvent);
        
        if (newEvent.title && newEvent.date) {
            try {
                if (!user) {
                    console.log('No user found, showing login alert');
                    alert('Please login first');
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
                    alert('Event added successfully!');
                } else {
                    const errorText = await response.text();
                    console.error('Add event failed:', response.status, errorText);
                    alert('Failed to add event, please try again');
                }
            } catch (error) {
                console.error('Error adding event:', error);
                alert('Error adding event');
            }
        } else {
            console.log('Missing required fields:', { title: newEvent.title, date: newEvent.date });
            alert('Please fill in event title and date');
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
                alert('Event deleted successfully!');
            } else {
                alert('Failed to delete event, please try again');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Error deleting event');
        }
    };

    // 格式化日期为YYYY-MM-DD
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };

    // 获取周的开始日期（周一）
    const getWeekStart = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
        return new Date(date.setDate(diff));
    };

    // 获取周的所有日期
    const getWeekDates = (date) => {
        const start = getWeekStart(new Date(date));
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
        }
        return week;
    };

    // 获取一天的小时数组
    const getDayHours = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(i);
        }
        return hours;
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
                alert('Please login first');
                return;
            }

            const response = await fetch(`/api/calendar/subscribe/${user.id}`);
            if (response.ok) {
                const url = await response.text();
                setSubscribeUrl(url);
                setShowSubscribeModal(true);
            } else {
                alert('Failed to generate subscription URL');
            }
        } catch (error) {
            console.error('Error generating subscribe URL:', error);
            alert('Error generating subscription URL');
        }
    };

    // 导出日历
    const exportCalendar = async () => {
        try {
            if (!user) {
                alert('Please login first');
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
                alert('Failed to export calendar');
            }
        } catch (error) {
            console.error('Error exporting calendar:', error);
            alert('Error exporting calendar');
        }
    };

    // 复制订阅URL到剪贴板
    const copySubscribeUrl = async () => {
        try {
            await navigator.clipboard.writeText(subscribeUrl);
            alert('Subscription URL copied to clipboard!');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('Copy failed, please copy manually');
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
                    <h2>Calendar</h2>
                </div>
                <div className="calendar-actions">
                    <button onClick={exportCalendar} className="action-button export-btn">
                        <Download size={16} />
                        Export Calendar
                    </button>
                    <button onClick={generateSubscribeUrl} className="action-button subscribe-btn">
                        <Share2 size={16} />
                        Generate Subscribe URL
                    </button>
                </div>
                <div className="calendar-navigation">
                    <button onClick={previousPeriod} className="nav-button">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="month-year">
                        {viewMode === 'day' 
                            ? currentDate.toLocaleDateString('zh-CN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                              })
                            : viewMode === 'week'
                            ? `Week ${Math.ceil(currentDate.getDate() / 7)}, ${currentDate.getFullYear()}`
                            : getMonthName(currentDate)
                        }
                    </h3>
                    <button onClick={nextPeriod} className="nav-button">
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                {/* 视图切换按钮 */}
                <div className="view-toggle">
                    <button 
                        className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
                        onClick={() => setViewMode('day')}
                    >
                        Day
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                        onClick={() => setViewMode('week')}
                    >
                        Week
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        Month
                    </button>
                </div>
            </div>

            <div className="calendar-content">
                {/* 根据视图模式渲染不同内容 */}
                {viewMode === 'day' && (
                    <div className="day-view">
                        <div className="day-header">
                            <h3>{currentDate.toLocaleDateString('zh-CN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                            })}</h3>
                        </div>
                        <div className="day-timeline">
                            {getDayHours().map(hour => (
                                <div key={hour} className="time-slot">
                                    <div className="time-label">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="time-content">
                                        {getEventsForDate(currentDate).filter(event => {
                                            const eventHour = new Date(event.startTime).getHours();
                                            return eventHour === hour;
                                        }).map(event => (
                                            <div key={event.id} className="day-event">
                                                <span className="event-time">
                                                    {new Date(event.startTime).toLocaleTimeString('zh-CN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                                <span className="event-title">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'week' && (
                    <div className="week-view">
                        <div className="week-header">
                            {getWeekDates(currentDate).map((date, index) => (
                                <div key={index} className="week-day-header">
                                    <div className="weekday-name">{getWeekdayNames()[date.getDay()]}</div>
                                    <div className={`weekday-date ${isToday(date) ? 'today' : ''}`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="week-grid">
                            {getWeekDates(currentDate).map((date, index) => (
                                <div key={index} className="week-day">
                                    <div className="week-events">
                                        {getEventsForDate(date).map(event => (
                                            <div key={event.id} className="week-event">
                                                <span className="event-time">
                                                    {new Date(event.startTime).toLocaleTimeString('zh-CN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                                <span className="event-title">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'month' && (
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
                )}

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
                            Add Event
                        </button>
                    </div>

                    {/* 活动列表 */}
                    <div className="events-list">
                        {selectedDateEvents.length === 0 ? (
                            <p className="no-events">No events today</p>
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

            {/* Add Event表单 */}
            {showEventForm && (
                <div className="event-form-overlay">
                    <div className="event-form">
                        <h3>Add New Event</h3>
                        <form onSubmit={(e) => { e.preventDefault(); addEvent(); }}>
                            <div className="form-group">
                                <label>Event Title *</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    value={newEvent.date || formatDateForInput(selectedDate)}
                                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEventForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Add Event
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
                        <h3>📅 Apple Calendar Subscription</h3>
                        <div className="subscribe-content">
                            <p className="subscribe-description">
                                Use the following URL to subscribe to your AI Smart Calendar on Apple devices:
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
                                    Copy
                                </button>
                            </div>
                            <div className="subscribe-instructions">
                                <h4>📱 Subscription Steps:</h4>
                                <ol>
                                    <li>Copy the URL above</li>
                                    <li>On Mac: Open "Calendar" app → File → New Calendar Subscription → Paste URL</li>
                                    <li>On iPhone/iPad: Open "Calendar" app → Calendars → Add Calendar → Add Subscription Calendar → Paste URL</li>
                                    <li>Click "Subscribe" to complete setup</li>
                                </ol>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button onClick={() => setShowSubscribeModal(false)} className="primary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
