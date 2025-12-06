const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const times = ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

export { days, times };

export const getDayOfWeek = (dayName: string): number => {
  const dayMap: Record<string, number> = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };
  return dayMap[dayName] || 1;
};

export const getDateForDay = (dayName: string): Date => {
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay();
  const targetDay = getDayOfWeek(dayName);

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }

  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);
  return date;
};

export const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let hour24 = hours;
  if (period === "PM" && hours !== 12) hour24 += 12;
  if (period === "AM" && hours === 12) hour24 = 0;
  return { hours: hour24, minutes: minutes || 0 };
};

export const getDateTimeForSlot = (day: string, time: string): Date => {
  const date = getDateForDay(day);
  const { hours, minutes } = parseTime(time);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const isTimeSlotPassed = (day: string, time: string): boolean => {
  const slotDateTime = getDateTimeForSlot(day, time);
  const now = new Date();
  return slotDateTime < now;
};

export const isMoreThanOneDayAhead = (day: string): boolean => {
  const slotDate = getDateForDay(day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  slotDate.setHours(0, 0, 0, 0);
  
  const diffTime = slotDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const todayDay = today.getDay();
  if (todayDay === 0 && day === "Lunes") {
    return false;
  }
  
  return diffDays > 1;
};

export const isLessThanOneHourBefore = (day: string, time: string): boolean => {
  const slotDateTime = getDateTimeForSlot(day, time);
  const now = new Date();
  const diffMs = slotDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 1 && diffHours > 0;
};

export const hasReservationForDay = (day: string, bookings: Array<{ day: string; time: string }>): boolean => {
  return bookings.some((b) => b.day === day);
};

export const getCurrentDayName = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const dayMap: Record<number, string> = {
    0: days[0],
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };
  
  return dayMap[dayOfWeek] || days[0];
};

export const getEarliestAvailableTime = (day: string): string => {
  for (const time of times) {
    if (!isTimeSlotPassed(day, time)) {
      return time;
    }
  }
  return times[0];
};

