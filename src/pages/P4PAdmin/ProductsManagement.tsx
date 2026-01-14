import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import Checkbox from "../../components/form/input/Checkbox";
import Badge from "../../components/ui/badge/Badge";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import PaginationWithIcon from "./PaginationWithIcon";

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
    logo?: string;
  };
  sold: boolean;
  soldCount: number;
  status: string;
  isActive: boolean;
  currency: string;
  createdAt: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [actionProductId, setActionProductId] = useState<string>("");
  const [actionProductName, setActionProductName] = useState<string>("");
  const [actionType, setActionType] = useState<"delete" | "sold" | null>(null);
  const confirmModal = useModal();
  const addProductModal = useModal();
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    brand: "",
    status: "New",
    currency: "TND",
    images: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [page, search, itemsPerPage, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: itemsPerPage, search };
      if (categoryFilter) {
        params.categoryId = categoryFilter;
      }
      console.log("Fetching products with params:", params);
      const response = await api.get("/marketplace/products", { params });
      console.log("Products response:", response.data);
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/marketplace/categories", { params: { limit: 100 } });
      console.log("Categories fetched:", response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get("/marketplace/brands", { params: { limit: 100 } });
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post("/marketplace/products", {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock)
      });
      addProductModal.closeModal();
      resetForm();
      fetchProducts();
      setActionLoading(false);
    } catch (error) {
      console.error("Failed to create product:", error);
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      stock: "",
      category: "",
      brand: "",
      status: "New",
      currency: "TND",
      images: [],
      isActive: true
    });
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url]
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(products.map((product) => product._id));
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

  const openConfirmModal = (productId: string, productName: string, type: "delete" | "sold") => {
    setActionProductId(productId);
    setActionProductName(productName);
    setActionType(type);
    confirmModal.openModal();
  };

  const handleConfirmAction = async () => {
    if (!actionProductId || !actionType) return;

    try {
      setActionLoading(true);
      if (actionType === "delete") {
        await api.delete(`/marketplace/products/${actionProductId}`);
      } else if (actionType === "sold") {
        await api.patch(`/marketplace/products/${actionProductId}/sold`);
      }
      confirmModal.closeModal();
      setActionLoading(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to perform action:", error);
      setActionLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Products Management | P4P Dashboard"
        description="Manage marketplace products"
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Products Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all products in the marketplace
          </p>
        </div>
        <button
          onClick={addProductModal.openModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Data Table 1 Template */}
      <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
        <div className="flex flex-col gap-3 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">Show</span>
              <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((value) => (
                  <option
                    key={value}
                    value={value}
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {value}
                  </option>
                ))}
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
              <span className="text-gray-500 dark:text-gray-400">entries</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Filter:</span>
              <div className="relative z-20 bg-transparent">
                <select
                  className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 min-w-[160px]"
                  value={categoryFilter}
                  onChange={(e) => {
                    console.log("Category filter changed to:", e.target.value);
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      {category.name}
                    </option>
                  ))}
                </select>
                <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                  <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative">
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0091 16.5541 14.3811 15.4551L17.5882 18.6606C17.9334 19.0058 18.4916 19.0057 18.8368 18.6605C19.182 18.3153 19.182 17.7571 18.8367 17.4119L15.6298 14.2052C16.7287 12.8332 17.3799 11.0917 17.3799 9.19922C17.3799 4.87366 13.8727 1.36639 9.54708 1.36639C9.48993 1.36639 9.43291 1.36716 9.37601 1.36871C9.37578 1.36857 9.37556 1.36843 9.37533 1.36829V1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div>
            <Table>
              <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Product</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Category</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Brand</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Price</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Stock</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Sold</p>
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-8 text-center border border-gray-100 dark:border-white/[0.05] text-gray-500 dark:text-gray-400">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <Checkbox
                          checked={selectedRows.includes(product._id)}
                          onChange={() => handleRowSelect(product._id)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {product.images[0] && (
                            <div className="w-10 h-10 overflow-hidden rounded-lg">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {product.name}
                            </span>
                            {product.discountPrice && (
                              <span className="block text-xs text-success-600">
                                Discount: {product.currency} {product.discountPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                        {product.category?.name || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {product.brand?.logo && (
                            <img
                              src={product.brand.logo}
                              alt={product.brand.name}
                              className="h-6 w-6 rounded object-contain"
                            />
                          )}
                          <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                            {product.brand?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm ${product.discountPrice ? "line-through text-gray-400" : ""}`}>
                            {product.currency} {product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="font-semibold text-success-600 text-theme-sm">
                              {product.currency} {product.discountPrice}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-normal dark:text-gray-400/90 text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                        {product.stock}
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Badge variant="light" color={product.sold ? "success" : "light"}>
                            {product.sold ? "Sold" : "Available"}
                          </Badge>
                          {product.soldCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {product.soldCount} sales
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <Badge variant="light" color={product.isActive ? "success" : "error"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit">
                            <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          {!product.sold && (
                            <button
                              onClick={() => openConfirmModal(product._id, product.name, "sold")}
                              className="rounded px-2 py-1 text-xs font-medium text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20"
                              title="Mark as Sold"
                            >
                              Sold
                            </button>
                          )}
                          <button
                            onClick={() => openConfirmModal(product._id, product.name, "delete")}
                            className="rounded p-1.5 hover:bg-error-50 dark:hover:bg-error-900/20"
                            title="Delete"
                          >
                            <TrashBinIcon className="h-4 w-4 text-error-600" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="pb-3 xl:pb-0">
              <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                Showing {products.length > 0 ? ((page - 1) * itemsPerPage) + 1 : 0} to {Math.min(page * itemsPerPage, (page - 1) * itemsPerPage + products.length)} of {products.length} entries
              </p>
            </div>
            <PaginationWithIcon
              totalPages={totalPages}
              initialPage={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Confirm {actionType === "delete" ? "Delete" : "Mark as Sold"}
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {actionType === "delete" 
              ? `Are you sure you want to delete "${actionProductName}"? This action cannot be undone.`
              : `Mark "${actionProductName}" as sold?`
            }
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={confirmModal.closeModal}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal isOpen={addProductModal.isOpen} onClose={() => { addProductModal.closeModal(); resetForm(); }} className="max-w-4xl">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="name" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="brand" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Condition
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="price" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="discountPrice" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Price
                </label>
                <input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="stock" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="TND">TND - Tunisian Dinar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter product description (optional)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Images
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Product ${idx + 1}`} className="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleImageUrlAdd}>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Image URL
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <input
                    type="checkbox"
                    id="productActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="productActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set product as active
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => { addProductModal.closeModal(); resetForm(); }} disabled={actionLoading}>
                Cancel
              </Button>
              <button
                disabled={actionLoading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {actionLoading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default ProductsManagement;
