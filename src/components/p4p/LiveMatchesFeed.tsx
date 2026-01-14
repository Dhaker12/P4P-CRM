import { useEffect, useState } from "react";
import api from "../../services/api";

interface Match {
  _id: string;
  teamA: { player1: string; player2: string };
  teamB: { player1: string; player2: string };
  score: { teamA: number; teamB: number };
  court: string;
  status: "live" | "upcoming" | "finished";
  startTime: string;
}

export default function LiveMatchesFeed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatches();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLiveMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await api.get("/dashboard/live-matches");
      setMatches(response.data.matches || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch live matches:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 animate-pulse";
      case "upcoming":
        return "bg-blue-500";
      case "finished":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Live Matches Feed
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time match updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎾</div>
            <p className="text-gray-500 dark:text-gray-400">
              No live matches at the moment
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {match.court}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${getStatusColor(
                      match.status
                    )}`}
                  ></span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {match.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {match.teamA.player1} / {match.teamA.player2}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {match.score.teamA}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {match.teamB.player1} / {match.teamB.player2}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {match.score.teamB}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Started: {new Date(match.startTime).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
