import { useState, useEffect } from "react";
import { useSrs } from "../../hooks";
import { Card } from "../../components/ui/Card";
import { BookOpen, Clock, Target, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { cn, getMasteryLabel } from "../../lib/utils";

function formatDate(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

export function DashboardPage() {
  const { statistics, reviewPlan, isLoading } = useSrs();

  // Clock state
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

  // Streak state
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const storedStreak = localStorage.getItem("study_streak");
    const lastStudyDate = localStorage.getItem("last_study_date");
    const today = new Date().toISOString().split("T")[0];

    if (storedStreak) {
      const currentStreak = parseInt(storedStreak, 10);
      if (statistics.total_cards > 0 && statistics.due_today === 0) {
        if (lastStudyDate === today) {
          setStreak(currentStreak);
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastStudyDate === yesterdayStr) {
            const newStreak = currentStreak + 1;
            localStorage.setItem("study_streak", newStreak.toString());
            localStorage.setItem("last_study_date", today);
            setStreak(newStreak);
          } else {
            localStorage.setItem("study_streak", "1");
            localStorage.setItem("last_study_date", today);
            setStreak(1);
          }
        }
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (lastStudyDate === today || lastStudyDate === yesterdayStr) {
          setStreak(currentStreak);
        } else {
          setStreak(0);
        }
      }
    } else if (statistics.total_cards > 0 && statistics.due_today === 0) {
      localStorage.setItem("study_streak", "1");
      localStorage.setItem("last_study_date", today);
      setStreak(1);
    }
  }, [statistics.due_today, statistics.total_cards]);

  if (isLoading) {
    return <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">Đang tải thống kê...</div>;
  }

  const stats = [
    {
      label: "Tổng số thẻ",
      value: statistics.total_cards,
      icon: BookOpen,
      iconColor: "text-indigo-600 dark:text-sky-400",
      bgColor: "bg-indigo-50/60 dark:bg-sky-950/40",
      sparklineColor: "text-indigo-500 dark:text-sky-400",
      sparklinePath: "M2,14 Q12,8 22,15 T42,10 T48,4",
      trend: (
        <span className="text-emerald-500 font-medium flex items-center">
          {statistics.total_cards_trend > 0 ? `+${statistics.total_cards_trend}` : "0"} thẻ <span className="ml-1 text-zinc-400 dark:text-zinc-500">so với tuần trước</span>
        </span>
      )
    },
    {
      label: "Cần ôn hôm nay",
      value: statistics.due_today,
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50/60 dark:bg-amber-950/40",
      sparklineColor: "text-amber-500",
      sparklinePath: "M2,16 Q12,12 22,6 T42,8 T48,2",
      trend: (
        <span className="text-orange-500 font-semibold flex items-center gap-1 select-none">
          🔥 {streak > 0 ? `Giữ chuỗi ${streak} ngày!` : "Ôn tập ngay để tạo chuỗi!"}
        </span>
      )
    },
    {
      label: "Đã thuộc",
      value: statistics.mastered_cards,
      icon: Target,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50/60 dark:bg-emerald-950/40",
      sparklineColor: "text-emerald-500",
      sparklinePath: "M2,12 Q12,16 22,10 T42,6 T48,2",
      trend: (
        <span className="text-emerald-500 font-medium flex items-center">
          {statistics.mastered_cards_trend > 0 ? `+${statistics.mastered_cards_trend}` : "0"} thẻ <span className="ml-1 text-zinc-400 dark:text-zinc-500">so với tuần trước</span>
        </span>
      )
    },
    {
      label: "Cấp độ TB",
      value: getMasteryLabel(Math.round(statistics.accuracy_rate)),
      icon: TrendingUp,
      iconColor: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50/60 dark:bg-violet-950/40",
      sparklineColor: "text-violet-500",
      sparklinePath: "M2,14 Q12,6 22,12 T42,8 T48,2",
      trend: (
        <span className="text-zinc-500 dark:text-zinc-400 select-none">
          Điểm: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{statistics.accuracy_rate.toFixed(2)}</span>
          <span className={cn("ml-1.5 font-semibold", statistics.accuracy_rate_trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
            ({statistics.accuracy_rate_trend >= 0 ? "+" : ""}{statistics.accuracy_rate_trend.toFixed(2)})
          </span>
        </span>
      )
    },
  ];

  const maxPlanCount = Math.max(...reviewPlan.map((d) => d.count), 10);
  const roundedMax = Math.ceil(maxPlanCount / 4) * 4;
  const yAxisValues = [roundedMax, (roundedMax * 3) / 4, roundedMax / 2, roundedMax / 4, 0];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
      {/* Header section with Dynamic DateTime */}
      <div className="flex items-center justify-between shrink-0 h-14">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Bảng thống kê</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Theo dõi tiến độ học tập của bạn</p>
        </div>

        {/* Dynamic DateTime Card */}
        <div className="flex items-center gap-3 px-3 py-1 border rounded-xl shadow-sm select-none bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{formattedDateStr}</span>
            <span className="text-zinc-500 dark:text-zinc-400">{formattedTimeStr}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content wrapper */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
        {/* 4 Core Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="flex flex-col justify-between p-5 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-zinc-900/50 hover:border-indigo-500/20 dark:hover:border-sky-500/20 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${stat.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                      <p className="text-2xl font-extrabold mt-0.5 text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                    </div>
                  </div>

                  {/* SVG Sparkline */}
                  <div className={cn("w-14 h-8 flex items-center justify-end", stat.sparklineColor)}>
                    <svg className="w-12 h-6" viewBox="0 0 50 20" fill="none">
                      <path
                        d={stat.sparklinePath}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Bottom trend info */}
                <div className="mt-4 flex items-center gap-1 text-xs">
                  {stat.trend}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dynamic Responsive Layout for lower section */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 items-stretch">
          {/* Progress By Level */}
          <Card className="p-5 xl:col-span-2 flex flex-col justify-between hover:shadow-md hover:border-indigo-500/10 dark:hover:border-sky-500/10 transition-all duration-300">
            <div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Tiến độ theo cấp độ
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Làm quen", value: statistics.new_cards, color: "bg-blue-500", dotColor: "bg-blue-500" },
                  { label: "Sơ cấp", value: statistics.learning_cards, color: "bg-sky-400", dotColor: "bg-sky-400" },
                  { label: "Trung cấp", value: statistics.familiar_cards, color: "bg-amber-500", dotColor: "bg-amber-500" },
                  { label: "Cao cấp", value: statistics.proficient_cards, color: "bg-emerald-500", dotColor: "bg-emerald-500" },
                  { label: "Tinh thông", value: statistics.mastered_cards, color: "bg-indigo-500", dotColor: "bg-indigo-500" },
                ].map((level) => (
                  <div key={level.label} className="flex items-center gap-4 group">
                    <span className={`w-2 h-2 rounded-full ${level.dotColor} flex-shrink-0 group-hover:scale-150 transition-transform duration-300`} />
                    <span className="w-20 text-sm font-medium text-zinc-500 dark:text-zinc-400">{level.label}</span>
                    <div className="flex-1 rounded-full h-2.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`${level.color} h-2.5 rounded-full transition-all duration-500 group-hover:brightness-110`}
                        style={{
                          width: `${
                            statistics.total_cards > 0
                              ? (level.value / statistics.total_cards) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-sm text-right font-semibold text-zinc-500 dark:text-zinc-400">{level.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 7-Day Review Plan Chart */}
          <Card className="p-5 xl:col-span-3 flex flex-col justify-between hover:shadow-md hover:border-indigo-500/10 dark:hover:border-sky-500/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kế hoạch ôn tập 7 ngày tới</h3>
              </div>

              <div className="flex flex-col h-56 justify-between">
                <div className="flex items-stretch gap-4 h-40">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between text-xs font-medium text-zinc-400 dark:text-zinc-500 h-[136px] pr-2 w-8 text-right select-none">
                    {yAxisValues.map((val) => (
                      <span key={val}>{val}</span>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 relative h-[136px]">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                      {yAxisValues.map((_, idx) => (
                        <div key={idx} className="border-b border-dashed border-zinc-100 dark:border-zinc-800 w-full h-0" />
                      ))}
                    </div>

                    {/* Bars Container */}
                    <div className="absolute inset-0 flex items-end justify-around gap-2 sm:gap-4 z-10">
                      {reviewPlan.map((day) => {
                        const barHeight = roundedMax > 0 ? (day.count / roundedMax) * 100 : 0;
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-default">
                            {/* Value Label above Bar */}
                            <span className="text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100 opacity-80 group-hover/bar:opacity-100 group-hover/bar:scale-110 transition-all duration-200">
                              {day.count}
                            </span>

                            {/* Bar */}
                            <div className="w-full rounded-t-md sm:rounded-t-lg relative flex-1 bg-zinc-100 dark:bg-zinc-800 overflow-hidden max-h-[85%]">
                              <div
                                className="absolute bottom-0 w-full rounded-t-md sm:rounded-t-lg transition-all duration-500 bg-gradient-to-t from-indigo-600 to-violet-400 dark:from-indigo-500 dark:to-violet-400 shadow-[0_-2px_10px_rgba(99,102,241,0.15)] group-hover/bar:from-indigo-500 group-hover/bar:to-pink-400 group-hover/bar:shadow-[0_-2px_12px_rgba(236,72,153,0.3)]"
                                style={{ height: `${barHeight}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Day labels container underneath the chart (X Axis labels) */}
                <div className="flex items-start gap-2 sm:gap-4 pl-12 select-none">
                  {reviewPlan.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center text-center">
                      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                        {day.day_label}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
