import { useState, useEffect } from "react";
import { useSrs } from "../../hooks";
import { Card } from "../../components/ui/Card";
import { Clock } from "../../components/ui/Clock";
import { BookOpen, Clock as ClockIcon, Target, TrendingUp, BarChart3 } from "lucide-react";
import { cn, getMasteryLabel } from "../../lib/utils";

export function DashboardPage() {
  const { statistics, reviewPlan, isLoading } = useSrs();

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
    return (
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <div className="h-14 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 flex-1">
          <div className="xl:col-span-2 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="xl:col-span-3 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Tổng số thẻ",
      value: statistics.total_cards,
      icon: BookOpen,
      trend: (
        <span className="text-emerald-500 font-medium flex items-center">
          {statistics.total_cards_trend > 0 ? `+${statistics.total_cards_trend}` : "0"} thẻ <span className="ml-1 text-zinc-400 dark:text-zinc-500">so với tuần trước</span>
        </span>
      ),
    },
    {
      label: "Cần ôn hôm nay",
      value: statistics.due_today,
      icon: ClockIcon,
      highlight: true,
      trend: (
        <span className="text-orange-500 font-semibold flex items-center gap-1 select-none">
          {streak > 0 ? `🔥 Giữ chuỗi ${streak} ngày!` : "Ôn tập ngay để tạo chuỗi!"}
        </span>
      ),
    },
    {
      label: "Đã thuộc",
      value: statistics.mastered_cards,
      icon: Target,
      trend: (
        <span className="text-emerald-500 font-medium flex items-center">
          {statistics.mastered_cards_trend > 0 ? `+${statistics.mastered_cards_trend}` : "0"} thẻ <span className="ml-1 text-zinc-400 dark:text-zinc-500">so với tuần trước</span>
        </span>
      ),
    },
    {
      label: "Cấp độ TB",
      value: getMasteryLabel(Math.round(statistics.accuracy_rate)),
      icon: TrendingUp,
      trend: (
        <span className="text-zinc-500 dark:text-zinc-400 select-none">
          Điểm: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{statistics.accuracy_rate.toFixed(2)}</span>
          <span className={cn("ml-1.5 font-semibold", statistics.accuracy_rate_trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
            ({statistics.accuracy_rate_trend >= 0 ? "+" : ""}{statistics.accuracy_rate_trend.toFixed(2)})
          </span>
        </span>
      ),
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
        <Clock />
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
                variant="flat"
                className="flex flex-col justify-between p-5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-all duration-200 group cursor-default"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      stat.highlight ? "bg-amber-50 dark:bg-amber-950/40" : "bg-zinc-100 dark:bg-zinc-800"
                    )}>
                      <Icon className={cn("w-6 h-6", stat.highlight ? "text-amber-500" : "text-zinc-500 dark:text-zinc-400")} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                      <p className="text-2xl font-bold mt-0.5 text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                    </div>
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
          <Card variant="flat" className="p-5 xl:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <BarChart3 className="w-5 h-5 text-accent" />
                Tiến độ theo cấp độ
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Làm quen", value: statistics.new_cards, color: "bg-zinc-400 dark:bg-zinc-600" },
                  { label: "Sơ cấp", value: statistics.learning_cards, color: "bg-sky-500" },
                  { label: "Trung cấp", value: statistics.familiar_cards, color: "bg-amber-500" },
                  { label: "Cao cấp", value: statistics.proficient_cards, color: "bg-emerald-500" },
                  { label: "Tinh thông", value: statistics.mastered_cards, color: "bg-accent" },
                ].map((level) => (
                  <div key={level.label} className="flex items-center gap-4 group">
                    <span className="w-20 text-sm font-medium text-zinc-500 dark:text-zinc-400">{level.label}</span>
                    <div className="flex-1 rounded-full h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={cn(level.color, "h-2 rounded-full transition-all duration-500")}
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
          <Card variant="flat" className="p-5 xl:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent" />
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
                                className="absolute bottom-0 w-full rounded-t-md sm:rounded-t-lg transition-all duration-500 bg-accent group-hover/bar:bg-accent-light"
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
                        {day.date.split('-').slice(1).reverse().join('/')}
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
