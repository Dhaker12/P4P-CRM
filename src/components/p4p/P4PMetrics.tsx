import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import api from "../../services/api";

interface MetricData {
  id: number;
  title: string;
  value: string | number;
  change: string;
  direction: "up" | "down";
  comparisonText: string;
  icon: React.ReactElement;
  loading?: boolean;
}

export default function P4PMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      id: 1,
      title: "Total Players",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "vs last month",
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z" fill="" />
          <path d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z" fill="" />
        </svg>
      ),
      loading: true,
    },
    {
      id: 2,
      title: "Active Matches Today",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "vs yesterday",
      icon: (
        <svg className="fill-current" width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z" fill=""/>
          <path d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z" fill=""/>
          <path d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z" fill=""/>
        </svg>
      ),
      loading: true,
    },
    {
      id: 3,
      title: "Total Clubs",
      value: "0",
      change: "+0",
      direction: "up",
      comparisonText: "new this month",
      icon: (
        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 3.02816 21.3813 3.96878 21.3813H18.0969C19.0375 21.3813 19.8657 21.0031 20.45 20.3844C21.0688 19.7656 21.3438 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.1157 19.8344H3.96878C3.52191 19.8344 3.14378 19.6625 2.86878 19.3531C2.59378 19.0438 2.45003 18.6313 2.48441 18.2188L4.20316 3.43751C4.30628 2.71563 4.91566 2.16563 5.60316 2.16563H16.4313C17.1188 2.16563 17.7282 2.71563 17.8313 3.43751L19.55 18.2531C19.5844 18.6656 19.4407 19.0438 19.2157 19.3531Z" fill=""/>
          <path d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.18139 8.35313 8.18139 6.80625C8.18139 6.6 8.21577 6.42813 8.25014 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73764 5.87813C6.66889 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z" fill=""/>
        </svg>
      ),
      loading: true,
    },
    {
      id: 4,
      title: "Upcoming Tournaments",
      value: "0",
      change: "+0",
      direction: "up",
      comparisonText: "scheduled",
      icon: (
        <svg className="fill-current" width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z" fill=""/>
          <path d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z" fill=""/>
          <path d="M19.0062 0.618744H17.15V0.618744C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H2.37185C1.26873 6.01562 0.543729 7.15 0.918729 8.14687L2.7781 12.9562C2.99998 13.5062 3.50623 13.8687 4.09373 13.8687H14.2281C14.8156 13.8687 15.3218 13.5062 15.5437 12.9562L17.4031 8.14687C17.7781 7.15 17.0187 6.01562 15.9156 6.01562H13.0343L13.3781 3.4406L13.5843 2.30624C13.6531 1.82187 14.1594 1.37499 14.6437 1.37499H14.8843L19.0062 0.618744ZM14.2281 12.35H4.09373L2.23435 7.54062H15.9156L14.2281 12.35Z" fill=""/>
        </svg>
      ),
      loading: true,
    },
  ]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/dashboard/metrics");
      const data = response.data;

      setMetrics([
        {
          id: 1,
          title: "Total Players",
          value: data.totalPlayers || 0,
          change: data.playersChange || "+0%",
          direction: data.playersChange?.startsWith("-") ? "down" : "up",
          comparisonText: "vs last month",
          icon: metrics[0].icon,
          loading: false,
        },
        {
          id: 2,
          title: "Active Matches Today",
          value: data.activeMatchesToday || 0,
          change: data.matchesChange || "+0%",
          direction: data.matchesChange?.startsWith("-") ? "down" : "up",
          comparisonText: "vs yesterday",
          icon: metrics[1].icon,
          loading: false,
        },
        {
          id: 3,
          title: "Total Clubs",
          value: data.totalClubs || 0,
          change: data.clubsChange || "+0",
          direction: "up",
          comparisonText: "new this month",
          icon: metrics[2].icon,
          loading: false,
        },
        {
          id: 4,
          title: "Upcoming Tournaments",
          value: data.upcomingTournaments || 0,
          change: `${data.totalTournaments || 0} total`,
          direction: "up",
          comparisonText: "scheduled",
          icon: metrics[3].icon,
          loading: false,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      setMetrics(prev => prev.map(m => ({ ...m, loading: false })));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  {item.icon}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {item.title}
                </p>
              </div>
              
              {item.loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <h4 className="font-bold text-gray-800 text-3xl dark:text-white/90">
                  {item.value}
                </h4>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Badge
              color={item.direction === "up" ? "success" : "error"}
              size="sm"
            >
              <span className="flex items-center gap-1">
                {item.direction === "up" ? (
                  <svg
                    className="fill-current"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.35716 2.47737L0.908974 5.82987C0.736474 5.99487 0.736474 6.26987 0.908974 6.43487C1.08147 6.59987 1.36647 6.59987 1.53897 6.43487L5.00022 3.06487L8.46147 6.43487C8.63397 6.59987 8.91897 6.59987 9.09147 6.43487C9.26397 6.26987 9.26397 5.99487 9.09147 5.82987L5.64328 2.47737C5.47078 2.31237 5.18578 2.31237 4.35716 2.47737Z"
                      fill=""
                    />
                  </svg>
                ) : (
                  <svg
                    className="fill-current"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.64284 7.52263L9.09102 4.17013C9.26352 4.00513 9.26352 3.73013 9.09102 3.56513C8.91852 3.40013 8.63352 3.40013 8.46102 3.56513L4.99977 6.93513L1.53852 3.56513C1.36602 3.40013 1.08102 3.40013 0.908519 3.56513C0.736019 3.73013 0.736019 4.00513 0.908519 4.17013L4.35671 7.52263C4.52921 7.68763 4.81421 7.68763 5.64284 7.52263Z"
                      fill=""
                    />
                  </svg>
                )}
                {item.change}
              </span>
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.comparisonText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
