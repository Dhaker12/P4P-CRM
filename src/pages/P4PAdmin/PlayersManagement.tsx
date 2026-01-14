import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { Link } from "react-router-dom";
import Checkbox from "../../components/form/input/Checkbox";
import Badge from "../../components/ui/badge/Badge";
import AvatarText from "../../components/ui/avatar/AvatarText";
import { TrashBinIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";

interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  status: number;
  createdAt: string;
  playerStats?: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    rank: number;
  };
}

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [actionPlayerId, setActionPlayerId] = useState<string | null>(null);
  const [actionPlayerName, setActionPlayerName] = useState<string>("");
  const [actionType, setActionType] = useState<"delete" | "suspend" | "activate" | null>(null);
  const confirmModal = useModal();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [page, search, statusFilter]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user-management/players", {
        params: { page, limit: 10, search, status: statusFilter }
      });
      setPlayers(response.data.players);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch players:", error);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(players.map((player) => player._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const openConfirmModal = (playerId: string, playerName: string, type: "delete" | "suspend" | "activate") => {
    setActionPlayerId(playerId);
    setActionPlayerName(playerName);
    setActionType(type);
    confirmModal.openModal();
  };

  const handleConfirmAction = async () => {
    if (!actionPlayerId || !actionType) return;

    try {
      setActionLoading(true);
      if (actionType === "delete") {
        await api.delete(`/user-management/players/${actionPlayerId}`);
      } else if (actionType === "suspend") {
        await api.patch(`/user-management/players/${actionPlayerId}/suspend`, {
          status: -1,
          reason: "Admin action"
        });
      } else if (actionType === "activate") {
        await api.patch(`/user-management/players/${actionPlayerId}/suspend`, {
          status: 1,
          reason: "Admin action"
        });
      }
      confirmModal.closeModal();
      await fetchPlayers();
    } catch (error) {
      console.error(`Failed to ${actionType} player:`, error);
    } finally {
      setActionLoading(false);
      setActionPlayerId(null);
      setActionPlayerName("");
      setActionType(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="light" color="success" size="sm">Active</Badge>;
      case 0:
        return <Badge variant="light" color="error" size="sm">Banned</Badge>;
      case -1:
        return <Badge variant="light" color="warning" size="sm">Suspended</Badge>;
      default:
        return <Badge variant="light" color="light" size="sm">Unknown</Badge>;
    }
  };

  return (
    <>
      <PageMeta
        title="Players Management | P4P Admin"
        description="Manage all players in the Padel platform"
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Players Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage all registered players
          </p>
        </div>
        <Link
          to="/p4p-admin/users/players/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Player
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="-1">Suspended</option>
              <option value="0">Banned</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Players
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total {players.length} players on this page
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <svg className="stroke-current fill-white dark:fill-gray-800" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.29004 5.90393H17.7067" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.7075 14.0961H2.29085" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z" fill="" stroke="" strokeWidth="1.5" />
                <path d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z" fill="" stroke="" strokeWidth="1.5" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900">
              <TableRow>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                    <span className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Player
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Email
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Status
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Matches
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Win Rate
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Joined
                </TableCell>
                <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse">Loading players...</div>
                  </TableCell>
                </TableRow>
              ) : players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No players found
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => (
                  <TableRow key={player._id}>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedRows.includes(player._id)}
                          onChange={() => handleRowSelect(player._id)}
                        />
                        <AvatarText 
                          name={`${player.firstName} ${player.lastName}`} 
                          className="w-10 h-10"
                        />
                        <div>
                          <Link
                            to={`/p4p-admin/users/players/${player._id}`}
                            className="mb-0.5 block text-theme-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            {player.firstName} {player.lastName}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {player.email}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      {getStatusBadge(player.status)}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {player.playerStats?.totalMatches || 0}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {player.playerStats?.winRate ? `${player.playerStats.winRate}%` : "N/A"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {new Date(player.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/p4p-admin/users/players/${player._id}`}
                          className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          View
                        </Link>
                        {player.status === 1 && (
                          <button
                            onClick={() => openConfirmModal(player._id, `${player.firstName} ${player.lastName}`, "suspend")}
                            className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                          >
                            Suspend
                          </button>
                        )}
                        {player.status === -1 && (
                          <button
                            onClick={() => openConfirmModal(player._id, `${player.firstName} ${player.lastName}`, "activate")}
                            className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => openConfirmModal(player._id, `${player.firstName} ${player.lastName}`, "delete")}
                          title="Delete player"
                        >
                          <TrashBinIcon className="text-gray-700 cursor-pointer size-5 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className={actionType === "delete" ? "fill-error-50 dark:fill-error-500/15" : actionType === "activate" ? "fill-success-50 dark:fill-success-500/15" : "fill-warning-50 dark:fill-warning-500/15"}
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
              {actionType === "delete" ? (
                <svg className="fill-error-600 dark:fill-error-500" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z" fill="" />
                </svg>
              ) : actionType === "activate" ? (
                <svg className="fill-success-600 dark:fill-success-500" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.25 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z" fill="" />
                </svg>
              ) : (
                <svg className="fill-warning-600 dark:fill-orange-400" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z" fill="" />
                </svg>
              )}
            </span>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {actionType === "delete" ? "Delete Player?" : actionType === "activate" ? "Activate Player?" : "Suspend Player?"}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {actionType === "delete" 
              ? `Are you sure you want to delete ${actionPlayerName}? This action cannot be undone and will permanently remove all player data.`
              : actionType === "activate"
              ? `Are you sure you want to activate ${actionPlayerName}? They will regain full access to their account.`
              : `Are you sure you want to suspend ${actionPlayerName}? They won't be able to access their account until reactivated.`
            }
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={confirmModal.closeModal}
              disabled={actionLoading}
              className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={`flex justify-center px-6 py-3 text-sm font-medium text-white rounded-lg shadow-theme-xs disabled:opacity-50 ${
                actionType === "delete" ? "bg-error-500 hover:bg-error-600" :
                actionType === "activate" ? "bg-success-500 hover:bg-success-600" :
                "bg-warning-500 hover:bg-warning-600"
              }`}
            >
              {actionLoading ? (
                actionType === "delete" ? "Deleting..." : actionType === "activate" ? "Activating..." : "Suspending..."
              ) : (
                actionType === "delete" ? "Delete Player" : actionType === "activate" ? "Activate Player" : "Suspend Player"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
