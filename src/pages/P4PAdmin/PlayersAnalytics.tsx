import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import { 
  UserCircleIcon,
  GroupIcon, 
  PieChartIcon,
  BoltIcon,
  TimeIcon,
  ShootingStarIcon
} from "../../icons";

interface PlayerStats {
  totalPlayers: number;
  activePlayers: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  averageWinRate: number;
  topPlayers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    playerStats: {
      wins: number;
      totalMatches: number;
      winRate: number;
      rank: number;
    };
  }>;
  levelDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  recentlyJoined: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    createdAt: string;
  }>;
}

const PlayersAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user-management/players/analytics");
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta
          title="Players Analytics | P4P Dashboard"
          description="Global statistics about players"
        />
        <div className="flex h-96 items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading analytics...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Players Analytics | P4P Dashboard"
        description="Global statistics about players"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <UserCircleIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Players</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats?.totalPlayers || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-500/10">
                <BoltIcon className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Players</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats?.activePlayers || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <TimeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Matches</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats?.totalMatches || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-500/10">
                <PieChartIcon className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Win Rate</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats?.averageWinRate?.toFixed(1) || 0}%
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Players */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-3">
              <ShootingStarIcon className="h-6 w-6 text-warning-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Top Players
              </h3>
            </div>
            <div className="space-y-3">
              {stats?.topPlayers?.map((player, index) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-600 dark:text-brand-400">
                      {index + 1}
                    </span>
                    <img
                      src={player.avatar}
                      alt={`${player.firstName} ${player.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {player.playerStats.totalMatches} matches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success-600 dark:text-success-400">
                      {player.playerStats.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {player.playerStats.wins}W
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Distribution */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <div className="mb-4 flex items-center gap-3">
              <GroupIcon className="h-6 w-6 text-brand-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Level Distribution
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { name: "Beginner", value: stats?.levelDistribution?.beginner || 0, color: "bg-blue-500" },
                { name: "Intermediate", value: stats?.levelDistribution?.intermediate || 0, color: "bg-green-500" },
                { name: "Advanced", value: stats?.levelDistribution?.advanced || 0, color: "bg-orange-500" },
                { name: "Expert", value: stats?.levelDistribution?.expert || 0, color: "bg-red-500" },
              ].map((level) => {
                const percentage = stats?.totalPlayers
                  ? ((level.value / stats.totalPlayers) * 100).toFixed(1)
                  : 0;
                return (
                  <div key={level.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {level.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {level.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${level.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recently Joined Players */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Recently Joined Players
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats?.recentlyJoined?.map((player) => (
              <div
                key={player._id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <img
                  src={player.avatar}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(player.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayersAnalytics;
