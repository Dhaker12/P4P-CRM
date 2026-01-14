import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../services/api";

interface RevenueData {
  weekly: number[];
  monthly: number[];
  categories: string[];
}

export default function P4PRevenueChart() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [revenueData, setRevenueData] = useState<RevenueData>({
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    categories: [],
  });

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      const response = await api.get(`/dashboard/revenue?period=${period}`);
      setRevenueData(response.data);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    }
  };

  const chartData: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, sans-serif",
    },
    colors: ["#10B981", "#3C50E0"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories:
        period === "weekly"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Revenue ($)",
      },
      labels: {
        formatter: function (val) {
          return "$" + val.toLocaleString();
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$" + val.toLocaleString();
        },
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: period === "weekly" ? revenueData.weekly : revenueData.monthly,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Revenue Overview
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your platform earnings
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === "weekly"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div id="p4p-revenue-chart">
        <ReactApexChart
          options={chartData}
          series={series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
}
