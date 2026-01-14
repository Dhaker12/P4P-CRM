import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";

interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  totalPoints: number;
  rank: number;
  level: string;
  currentStreak: number;
}

interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  gender: string;
  createdAt: string;
  playerStats: PlayerStats;
}

interface Match {
  _id: string;
  startTime: string;
  status: string;
  result: string;
  club: {
    name: string;
    address: string;
  };
  teamA: any[];
  teamB: any[];
}

export default function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "matches" | "stats">("profile");
  const [notFound, setNotFound] = useState(false);
  const deleteModal = useModal();
  const suspendModal = useModal();
  const activateModal = useModal();
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("Player Not Found!");
  const [errorDescription, setErrorDescription] = useState<string>(
    "The player you are looking for does not exist or may have been removed."
  );

  useEffect(() => {
    fetchPlayerDetails();
  }, [id]);

  const fetchPlayerDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user-management/players/${id}`);
      setPlayer(response.data.player);
      setMatches(response.data.matches || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch player details:", error);
      setLoading(false);
      if (error.response?.status === 404 || !error.response) {
        setNotFound(true);
        
        // Check if it's a non-player account
        if (error.response?.data?.reason && error.response?.data?.accountType) {
          setErrorMessage("Not a Player Account");
          setErrorDescription(
            `This account is registered as ${error.response.data.accountType === 'superAdmin' ? 'a Super Admin' : 
             error.response.data.accountType === 'clubAdmin' ? 'a Club Admin' : 
             error.response.data.accountType === 'coach' ? 'a Coach' : 
             'an Admin'} account, not a player.`
          );
        }
      }
    }
  };

  const handleSuspend = async () => {
    try {
      setActionLoading(true);
      await api.patch(`/user-management/players/${id}/suspend`, {
        status: -1,
        reason: "Admin action"
      });
      suspendModal.closeModal();
      await fetchPlayerDetails();
    } catch (error) {
      console.error("Failed to update player status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActionLoading(true);
      await api.patch(`/user-management/players/${id}/suspend`, {
        status: 1,
        reason: "Admin action"
      });
      activateModal.closeModal();
      await fetchPlayerDetails();
    } catch (error) {
      console.error("Failed to update player status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/user-management/players/${id}`);
      deleteModal.closeModal();
      navigate("/p4p-admin/users/players");
    } catch (error) {
      console.error("Failed to delete player:", error);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Loading..." description="Loading player details" />
        <div className="flex h-96 items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading player details...</div>
        </div>
      </>
    );
  }

  if (notFound || !player) {
    return (
      <>
        <PageMeta title="Player Not Found" description="Player not found" />
        <Modal
          isOpen={true}
          onClose={() => navigate("/p4p-admin/users/players")}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <div className="text-center">
            <div className="relative flex items-center justify-center z-1 mb-7">
              <svg
                className="fill-warning-50 dark:fill-warning-500/15"
                width="90"
                height="90"
                viewBox="0 0 90 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                  fill=""
                  fillOpacity=""
                />
              </svg>
              <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <svg
                  className="fill-warning-600 dark:fill-orange-400"
                  width="38"
                  height="38"
                  viewBox="0 0 38 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z"
                    fill=""
                  />
                </svg>
              </span>
            </div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
              {errorMessage}
            </h4>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
              {errorDescription}
            </p>
            <div className="flex items-center justify-center w-full gap-3 mt-7">
              <button
                type="button"
                onClick={() => navigate("/p4p-admin/users/players")}
                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600 sm:w-auto"
              >
                Back to Players
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${player.firstName} ${player.lastName} | Player Details`}
        description="Player profile and management"
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/p4p-admin/users/players"
            className="mb-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Players
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Player Details
          </h1>
        </div>
        <div className="flex gap-3">
          {player.status === 1 && (
            <button
              onClick={suspendModal.openModal}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              Suspend Player
            </button>
          )}
          {player.status === -1 && (
            <button
              onClick={activateModal.openModal}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Activate Player
            </button>
          )}
          <button
            onClick={deleteModal.openModal}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete Player
          </button>
        </div>
      </div>

      {/* Player Header */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-start gap-6">
          <img
            src={player.avatar || "/images/user/default-avatar.jpg"}
            alt={player.firstName}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {player.firstName} {player.lastName}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{player.email}</p>
            <div className="mt-4 flex items-center gap-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  player.status === 1
                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : player.status === -1
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {player.status === 1 ? "Active" : player.status === -1 ? "Suspended" : "Banned"}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Joined {new Date(player.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === "matches"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Match History ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Statistics & Ranking
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {player.firstName} {player.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{player.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{player.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{player.gender || "Not specified"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {player.playerStats?.totalMatches || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {player.playerStats?.wins || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {player.playerStats?.losses || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/10">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {player.playerStats?.winRate || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "matches" && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Club
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Opponent
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No match history available
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => (
                    <tr key={match._id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(match.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>{match.club?.name || "N/A"}</div>
                        {match.club?.address && (
                          <div className="text-xs text-gray-500">{match.club.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Team Match
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            match.result === "win"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                              : "bg-red-100 text-red-600 dark:bg-red-900/20"
                          }`}
                        >
                          {match.result || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-400">
                        {match.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Performance
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Total Points</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {player.playerStats?.totalPoints || 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Current Streak</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {player.playerStats?.currentStreak || 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Player Level</dt>
                <dd className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                  {player.playerStats?.level || "Beginner"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Global Rank</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  #{player.playerStats?.rank || "Unranked"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-error-50 dark:fill-error-500/15"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-error-600 dark:fill-error-500"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            Delete Player?
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to delete {player?.firstName} {player?.lastName}? This action cannot be undone and will permanently remove all player data.
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={deleteModal.closeModal}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:opacity-50"
            >
              {actionLoading ? "Deleting..." : "Delete Player"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={suspendModal.isOpen}
        onClose={suspendModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-warning-50 dark:fill-warning-500/15"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-warning-600 dark:fill-orange-400"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            Suspend Player?
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to suspend {player?.firstName} {player?.lastName}? They won't be able to access their account until reactivated.
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={suspendModal.closeModal}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSuspend}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600 disabled:opacity-50"
            >
              {actionLoading ? "Suspending..." : "Suspend Player"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Activate Confirmation Modal */}
      <Modal
        isOpen={activateModal.isOpen}
        onClose={activateModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-success-50 dark:fill-success-500/15"
              width="90"
              height="90"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-success-600 dark:fill-success-500"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.25 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            Activate Player?
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to activate {player?.firstName} {player?.lastName}? They will regain full access to their account.
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={activateModal.closeModal}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleActivate}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-50"
            >
              {actionLoading ? "Activating..." : "Activate Player"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
