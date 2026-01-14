import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";

interface ClubOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  phone: string;
  createdAt: string;
}

export default function ClubOwnersManagement() {
  const [clubOwners, setClubOwners] = useState<ClubOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClubOwners();
  }, [page, search]);

  const fetchClubOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user-management/club-owners", {
        params: { page, limit: 10, search }
      });
      setClubOwners(response.data.clubOwners);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch club owners:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Club Owners Management | P4P Admin" description="Manage club owners" />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Club Owners Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all club owners and their facilities
          </p>
        </div>
        <Link
          to="/p4p-admin/users/club-owners/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Club Owner
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <input
          type="text"
          placeholder="Search club owners..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Club Owners Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-semibold">Owner</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Phone</TableCell>
                <TableCell className="font-semibold">Joined</TableCell>
                <TableCell className="font-semibold text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse">Loading club owners...</div>
                  </TableCell>
                </TableRow>
              ) : clubOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No club owners found
                  </TableCell>
                </TableRow>
              ) : (
                clubOwners.map((owner) => (
                  <TableRow key={owner._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={owner.avatar || "/images/user/default-avatar.jpg"}
                          alt={owner.firstName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <p className="font-medium">
                          {owner.firstName} {owner.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.phone || "N/A"}</TableCell>
                    <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-200">
                          View Details
                        </button>
                        <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
                          Manage Clubs
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
