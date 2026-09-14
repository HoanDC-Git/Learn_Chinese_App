import { useState, useEffect } from "react";

export function Clock() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = dateTime.getDay();
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const formattedDay = dayNames[dayOfWeek];

  const date = dateTime.getDate().toString().padStart(2, '0');
  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
  const year = dateTime.getFullYear();
  const formattedDateStr = `${formattedDay}, ${date}/${month}/${year}`;

  const hours = dateTime.getHours().toString().padStart(2, '0');
  const minutes = dateTime.getMinutes().toString().padStart(2, '0');
  const formattedTimeStr = `${hours}:${minutes}`;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border rounded-xl shadow-sm select-none bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex flex-col text-xs leading-tight">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">{formattedDateStr}</span>
        <span className="text-zinc-500 dark:text-zinc-400">{formattedTimeStr}</span>
      </div>
    </div>
  );
}
