import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export function TimePicker({ value, onChange, placeholder = "Select time" }) {
    // Parse value from 24-hour format
    const parseTime = (time24) => {
        if (!time24) return { hour: '', minute: '', period: 'AM' };
        
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        
        if (hour === 0) {
            hour = 12;
        } else if (hour > 12) {
            hour -= 12;
        }
        
        return {
            hour: hour.toString(),
            minute: minutes,
            period
        };
    };

    const { hour: initialHour, minute: initialMinute, period: initialPeriod } = parseTime(value);
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const [period, setPeriod] = useState(initialPeriod);

    useEffect(() => {
        const { hour, minute, period } = parseTime(value);
        setHour(hour);
        setMinute(minute);
        setPeriod(period);
    }, [value]);

    // Update parent when any value changes
    const updateTime = (newHour, newMinute, newPeriod, shouldPadMinute = true) => {
        if (!newHour || !newMinute) {
            onChange('');
            return;
        }

        let hour24 = parseInt(newHour);
        
        if (newPeriod === 'AM' && hour24 === 12) {
            hour24 = 0;
        } else if (newPeriod === 'PM' && hour24 !== 12) {
            hour24 += 12;
        }
        
        // Only pad minute if specified (on blur, not while typing)
        const formattedMinute = shouldPadMinute ? newMinute.padStart(2, '0') : newMinute;
        const time24 = `${hour24.toString().padStart(2, '0')}:${formattedMinute}`;
        onChange(time24);
    };

    const handleHourChange = (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;
        
        // Limit to 2 digits
        if (value.length > 2) return;
        
        // Validate hour range (1-12)
        const numValue = parseInt(value);
        if (value !== '' && (numValue < 1 || numValue > 12)) return;
        
        setHour(value);
        if (value && minute) {
            updateTime(value, minute, period, false);
        }
    };

    const handleMinuteChange = (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;
        
        // Limit to 2 digits
        if (value.length > 2) return;
        
        // Validate minute range (0-59)
        const numValue = parseInt(value);
        if (value !== '' && numValue > 59) return;
        
        setMinute(value);
        if (hour && value) {
            // Don't pad while typing
            updateTime(hour, value, period, false);
        }
    };

    const handleHourBlur = () => {
        if (hour && hour.length === 1) {
            setHour(hour);
        }
    };

    const handleMinuteBlur = () => {
        if (minute) {
            const paddedMinute = minute.padStart(2, '0');
            setMinute(paddedMinute);
            if (hour) {
                updateTime(hour, paddedMinute, period, true);
            }
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (hour && minute) {
            updateTime(hour, minute, newPeriod, true);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                <Input
                    type="text"
                    value={hour}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    placeholder="HH"
                    className="w-16 text-center"
                    maxLength="2"
                />
                <span className="mx-1 text-muted-foreground">:</span>
                <Input
                    type="text"
                    value={minute}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    placeholder="MM"
                    className="w-16 text-center"
                    maxLength="2"
                />
            </div>
            <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-20">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}