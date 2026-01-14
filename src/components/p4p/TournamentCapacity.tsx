import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../services/api";

export default function TournamentCapacity() {
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState(0);
  const [stats, setStats] = useState({
    registered: 0,
    total: 0,
  });

  useEffect(() => {
    fetchTournamentCapacity();
  }, []);

  const fetchTournamentCapacity = async () => {
    try {
      const response = await api.get("/dashboard/tournament-capacity");
      const percentage = response.data.percentage || 0;
      setCapacity(percentage);
      setStats({
        registered: response.data.registered || 0,
        total: response.data.total || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tournament capacity:", error);
      setLoading(false);
    }
  };

  const series = [capacity];
  const options: ApexOptions = {
    colors: ["#F59E0B"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "75%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#F59E0B"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Capacity"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-11 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Tournament Capacity
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Overall registration capacity for upcoming tournaments
          </p>
        </div>

        {loading ? (
          <div className="h-[330px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            <div>
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.registered}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Registered
                </p>
              </div>
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Capacity
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
