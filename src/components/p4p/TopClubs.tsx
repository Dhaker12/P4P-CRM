import { useEffect, useState } from "react";
import api from "../../services/api";

interface Club {
  _id: string;
  name: string;
  matchCount: number;
  playerCount: number;
  location?: string;
}

export default function TopClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopClubs();
  }, []);

  const fetchTopClubs = async () => {
    try {
      const response = await api.get("/dashboard/top-clubs");
      setClubs(response.data.clubs || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch top clubs:", error);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-800 dark:text-white">
          Top Clubs by Activity
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Clubs with the most matches and players
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No club data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Club Name
                </th>
                <th className="pb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Matches
                </th>
                <th className="pb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Players
                </th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club, index) => (
                <tr
                  key={club._id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <td className="py-4 text-left">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : index === 1
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          : index === 2
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 text-left">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {club.name}
                      </p>
                      {club.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {club.location}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      {club.matchCount}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {club.playerCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
