import { useState } from 'react';

export function useDateNavigation(initialDate: Date = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => changeDate(1);
  const goToPreviousDay = () => changeDate(-1);
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToSpecificDate = (date: Date) => {
    setCurrentDate(date);
  };

  return {
    currentDate,
    changeDate,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    goToSpecificDate,
    setCurrentDate
  };
}