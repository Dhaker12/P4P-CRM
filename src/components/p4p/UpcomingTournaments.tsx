import { useEffect, useState } from "react";
import api from "../../services/api";

interface Tournament {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "registration" | "ongoing";
}

export default function UpcomingTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await api.get("/dashboard/tournaments/upcoming");
      setTournaments(response.data.tournaments || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      registration: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      ongoing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  const getParticipationPercentage = (current: number, max: number) => {
    return ((current / max) * 100).toFixed(0);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Upcoming Tournaments
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Events in the pipeline
          </p>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming tournaments
            </p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {tournament.name}
                  </h5>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{tournament.location}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    tournament.status
                  )}`}
                >
                  {tournament.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString()} -{" "}
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Participants
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {tournament.participants} / {tournament.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${getParticipationPercentage(
                        tournament.participants,
                        tournament.maxParticipants
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
