import { useEffect, useState } from "react";
import api from "../../services/api";

interface Alert {
  _id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 15 seconds
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get("/dashboard/alerts");
      setAlerts(response.data.alerts || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30";
      default:
        return "bg-gray-50 dark:bg-gray-900/10";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            System Alerts
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Important notifications and issues
          </p>
        </div>
        {alerts.filter((a) => !a.resolved).length > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
            {alerts.filter((a) => !a.resolved).length} Active
          </span>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500 dark:text-gray-400">
              All systems operational
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-4 ${getAlertBgColor(
                alert.type
              )} ${alert.resolved ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-semibold text-gray-800 dark:text-white text-sm">
                      {alert.title}
                    </h5>
                    {alert.resolved && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {alert.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.filter((a) => !a.resolved).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            View All Alerts →
          </button>
        </div>
      )}
    </div>
  );
}
