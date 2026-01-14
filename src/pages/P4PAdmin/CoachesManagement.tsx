import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";

interface Coach {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  status: number;
  createdAt: string;
  preferences?: {
    commissionRate?: number;
  };
}

export default function CoachesManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState(15);

  useEffect(() => {
    fetchCoaches();
  }, [page, search]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user-management/coaches", {
        params: { page, limit: 10, search }
      });
      setCoaches(response.data.coaches);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/user-management/coaches/${id}/status`, {
        status: 1
      });
      fetchCoaches();
    } catch (error) {
      console.error("Failed to approve coach:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/user-management/coaches/${id}/status`, {
        status: -1
      });
      fetchCoaches();
    } catch (error) {
      console.error("Failed to reject coach:", error);
    }
  };

  const handleSetCommission = async (id: string) => {
    try {
      await api.patch(`/user-management/coaches/${id}/status`, {
        commissionRate
      });
      setSelectedCoach(null);
      fetchCoaches();
    } catch (error) {
      console.error("Failed to set commission:", error);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">Approved</span>;
      case 0:
        return <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Pending</span>;
      case -1:
        return <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">Rejected</span>;
      default:
        return <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Unknown</span>;
    }
  };

  return (
    <>
      <PageMeta title="Coaches Management | P4P Admin" description="Manage all coaches" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Coaches Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Approve, manage, and set commission rates for coaches
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search coaches..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Coaches Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-semibold">Coach</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Commission</TableCell>
                <TableCell className="font-semibold">Joined</TableCell>
                <TableCell className="font-semibold text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-pulse">Loading coaches...</div>
                  </TableCell>
                </TableRow>
              ) : coaches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No coaches found
                  </TableCell>
                </TableRow>
              ) : (
                coaches.map((coach) => (
                  <TableRow key={coach._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={coach.avatar || "/images/user/default-avatar.jpg"}
                          alt={coach.firstName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <p className="font-medium">
                          {coach.firstName} {coach.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{coach.email}</TableCell>
                    <TableCell>{getStatusBadge(coach.status)}</TableCell>
                    <TableCell>
                      {selectedCoach === coach._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-20 rounded border px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleSetCommission(coach._id)}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedCoach(null)}
                            className="text-xs text-gray-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCoach(coach._id);
                            setCommissionRate(coach.preferences?.commissionRate || 15);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {coach.preferences?.commissionRate || 15}%
                        </button>
                      )}
                    </TableCell>
                    <TableCell>{new Date(coach.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {coach.status !== 1 && (
                          <button
                            onClick={() => handleApprove(coach._id)}
                            className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-200"
                          >
                            Approve
                          </button>
                        )}
                        {coach.status !== -1 && (
                          <button
                            onClick={() => handleReject(coach._id)}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200"
                          >
                            Reject
                          </button>
                        )}
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
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
