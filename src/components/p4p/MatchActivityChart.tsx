import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../services/api";

export default function MatchActivityChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    categories: [] as string[],
    data: [] as number[],
  });

  useEffect(() => {
    fetchMatchActivity();
  }, []);

  const fetchMatchActivity = async () => {
    try {
      const response = await api.get("/dashboard/match-activity");
      setChartData({
        categories: response.data.months || [],
        data: response.data.counts || [],
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch match activity:", error);
      setLoading(false);
    }
  };

  const options: ApexOptions = {
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 310,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} matches`,
      },
    },
  };

  const series = [
    {
      name: "Matches Played",
      data: chartData.data,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Match Activity
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Total matches played per month
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[310px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[500px] xl:min-w-full">
            <Chart options={options} series={series} type="bar" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
