import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import P4PMetrics from "../../components/p4p/P4PMetrics";
import P4PRevenueChart from "../../components/p4p/P4PRevenueChart";
import LiveMatchesFeed from "../../components/p4p/LiveMatchesFeed";
import UpcomingTournaments from "../../components/p4p/UpcomingTournaments";
import SystemAlerts from "../../components/p4p/SystemAlerts";
import QuickStats from "../../components/p4p/QuickStats";
import RecentActivities from "../../components/p4p/RecentActivities";
import UserGrowthChart from "../../components/p4p/UserGrowthChart";
import MatchActivityChart from "../../components/p4p/MatchActivityChart";
import TournamentCapacity from "../../components/p4p/TournamentCapacity";
import TopClubs from "../../components/p4p/TopClubs";

export default function P4PDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Auto-refresh dashboard every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <PageMeta
        title="P4P Dashboard | Padel Platform Management"
        description="Comprehensive dashboard for managing your Padel platform - players, matches, courts, and revenue"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          P4P Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time overview of your Padel platform
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Main KPI Cards */}
        <div className="col-span-12">
          <P4PMetrics key={refreshKey} />
        </div>

        {/* Revenue Chart */}
        <div className="col-span-12 xl:col-span-8">
          <P4PRevenueChart />
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 xl:col-span-4">
          <QuickStats key={refreshKey} />
        </div>

        {/* User Growth Chart */}
        <div className="col-span-12 xl:col-span-6">
          <UserGrowthChart />
        </div>

        {/* Match Activity Chart */}
        <div className="col-span-12 xl:col-span-6">
          <MatchActivityChart />
        </div>

        {/* System Alerts */}
        <div className="col-span-12 xl:col-span-8">
          <SystemAlerts key={refreshKey} />
        </div>

        {/* Tournament Capacity */}
        <div className="col-span-12 xl:col-span-4">
          <TournamentCapacity key={refreshKey} />
        </div>

        {/* Top Clubs */}
        <div className="col-span-12 xl:col-span-7">
          <TopClubs key={refreshKey} />
        </div>

        {/* Live Matches Feed */}
        <div className="col-span-12 xl:col-span-5">
          <LiveMatchesFeed key={refreshKey} />
        </div>

        {/* Upcoming Tournaments */}
        <div className="col-span-12 xl:col-span-7">
          <UpcomingTournaments />
        </div>

        {/* Recent Activities */}
        <div className="col-span-12 xl:col-span-5">
          <RecentActivities key={refreshKey} />
        </div>
      </div>
    </>
  );
}
