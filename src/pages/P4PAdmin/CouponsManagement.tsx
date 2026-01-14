import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../icons";
import api from "../../services/api";
import PaginationWithIcon from "./PaginationWithIcon";

type Coupon = {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
};

type CouponFormData = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      coupon.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, coupons]);

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCoupons.length);
  const currentCoupons = filteredCoupons.slice(startIndex, endIndex);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/coupons");
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        minPurchaseAmount: formData.minPurchaseAmount || undefined,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
      };

      if (selectedCoupon) {
        await api.put(`/marketplace/coupons/${selectedCoupon._id}`, submitData);
        editModal.closeModal();
      } else {
        await api.post("/marketplace/coupons", submitData);
        addModal.closeModal();
      }
      await fetchCoupons();
      resetForm();
    } catch (error: any) {
      console.error("Failed to save coupon:", error);
      alert(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setLoading(true);
    try {
      await api.delete(`/marketplace/coupons/${selectedCoupon._id}`);
      await fetchCoupons();
      deleteModal.closeModal();
      resetForm();
    } catch (error: any) {
      console.error("Failed to delete coupon:", error);
      alert(error.response?.data?.message || "Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom.split("T")[0],
      validUntil: coupon.validUntil.split("T")[0],
      isActive: coupon.isActive,
    });
    editModal.openModal();
  };

  const openDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    deleteModal.openModal();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minPurchaseAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
    setSelectedCoupon(null);
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

  const getCouponStatus = (coupon: Coupon) => {
    const expired = isExpired(coupon.validUntil);
    const limitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
    
    if (!coupon.isActive) return { text: "Inactive", variant: "light" as const };
    if (expired) return { text: "Expired", variant: "error" as const };
    if (limitReached) return { text: "Limit Reached", variant: "warning" as const };
    return { text: "Active", variant: "success" as const };
  };

  return (
    <>
      <PageMeta title="Coupons Management | P4P Dashboard" description="Manage discount coupons" />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Coupons Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage discount coupons for the marketplace
          </p>
        </div>
        <button
          onClick={addModal.openModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Data Table 1 Template */}
      <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">Show</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map((value) => (
                  <option key={value} value={value} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    {value}
                  </option>
                ))}
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">entries</span>
          </div>

          <div className="relative">
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0091 16.5541 14.3811 15.4551L17.5882 18.6606C17.9334 19.0058 18.4916 19.0057 18.8368 18.6605C19.182 18.3153 19.182 17.7571 18.8367 17.4119L15.6298 14.2052C16.7287 12.8332 17.3799 11.0917 17.3799 9.19922C17.3799 4.87366 13.8727 1.36639 9.54708 1.36639C9.48993 1.36639 9.43291 1.36716 9.37601 1.36871C9.37578 1.36857 9.37556 1.36843 9.37533 1.36829V1.54199Z" fill="" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by coupon code..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div>
            <Table>
              <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Code</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Discount</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Usage</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Valid Period</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Status</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Actions</p>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell className="px-4 py-8 text-center border border-gray-100 dark:border-white/[0.05]">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-8 text-center border border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCoupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <TableRow key={coupon._id}>
                        <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                          <span className="font-mono font-semibold text-gray-800 dark:text-white/90 text-theme-sm">{coupon.code}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `${coupon.discountValue} TND`}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm">
                          {coupon.usedCount} / {coupon.usageLimit || "∞"}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <div className="text-sm">
                            <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                            <div className="text-gray-500 dark:text-gray-500">to {new Date(coupon.validUntil).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                          <Badge variant="light" color={status.variant}>{status.text}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(coupon)} className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit">
                              <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button onClick={() => openDeleteModal(coupon)} className="rounded p-1.5 hover:bg-error-50 dark:hover:bg-error-900/20" title="Delete">
                              <TrashBinIcon className="h-4 w-4 text-error-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="pb-3 xl:pb-0">
              <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                Showing {startIndex + 1} to {endIndex} of {filteredCoupons.length} entries
              </p>
            </div>
            <PaginationWithIcon totalPages={totalPages} initialPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      {/* Add/Edit Coupon Modal */}
      <Modal isOpen={addModal.isOpen || editModal.isOpen} onClose={() => { addModal.closeModal(); editModal.closeModal(); resetForm(); }} className="max-w-[700px]">
        <div className="p-6">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
            {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="SUMMER2024"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 font-mono outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Enter a unique coupon code (letters and numbers only)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (TND)</option>
                </select>
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  required
                  min="0"
                  max={formData.discountType === "percentage" ? 100 : undefined}
                  step="0.01"
                  placeholder={formData.discountType === "percentage" ? "10" : "50"}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Purchase Amount (TND)
                </label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Discount Amount (TND)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                min="0"
                placeholder="0 for unlimited"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Set to 0 for unlimited usage
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <input
                type="checkbox"
                id="couponActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="couponActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set coupon as active
              </label>
            </div>

            <div className="flex items-center justify-end gap-4 pt-2">
              <Button variant="outline" onClick={() => { addModal.closeModal(); editModal.closeModal(); resetForm(); }} disabled={loading}>
                Cancel
              </Button>
              <button
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : (selectedCoupon ? "Update Coupon" : "Create Coupon")}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Coupon Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.closeModal(); resetForm(); }} className="max-w-[500px]">
        <div className="p-6">
          <div className="mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="mb-2 text-center text-xl font-semibold text-gray-800 dark:text-white">Delete Coupon</h3>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete coupon "<span className="font-semibold font-mono">{selectedCoupon?.code}</span>"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => { deleteModal.closeModal(); resetForm(); }} disabled={loading}>
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {loading ? "Deleting..." : "Delete Coupon"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CouponsManagement;
