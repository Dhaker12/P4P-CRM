import { useState, useEffect } from "react";
import { PieChartIcon, BoxIcon, DollarLineIcon, GroupIcon } from "../../icons";
import api from "../../services/api";

type AnalyticsData = {
  totalProducts: number;
  activeProducts: number;
  totalBrands: number;
  activeBrands: number;
  totalCategories: number;
  activeCategories: number;
  totalSales: number;
  topProducts: Array<{
    _id: string;
    name: string;
    soldCount: number;
    price: number;
    images: string[];
  }>;
  topBrands: Array<{
    _id: string;
    name: string;
    logo?: string;
    productCount: number;
    totalSales: number;
  }>;
  categoryDistribution: Array<{
    _id: string;
    name: string;
    productCount: number;
  }>;
  priceStats: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  };
};

const MarketplaceAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/marketplace/analytics");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Products",
      value: analytics.totalProducts,
      subtext: `${analytics.activeProducts} active`,
      icon: BoxIcon,
      color: "blue",
    },
    {
      label: "Total Brands",
      value: analytics.totalBrands,
      subtext: `${analytics.activeBrands} active`,
      icon: DollarLineIcon,
      color: "purple",
    },
    {
      label: "Total Categories",
      value: analytics.totalCategories,
      subtext: `${analytics.activeCategories} active`,
      icon: PieChartIcon,
      color: "green",
    },
    {
      label: "Total Sales",
      value: analytics.totalSales,
      subtext: "products sold",
      icon: GroupIcon,
      color: "orange",
    },
  ];

  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of marketplace performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products
          </h2>
          {analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <BoxIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">{product.price} TND</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {product.soldCount}
                    </p>
                    <p className="text-xs text-gray-500">sold</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Top Brands */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Brands</h2>
          {analytics.topBrands.length > 0 ? (
            <div className="space-y-4">
              {analytics.topBrands.map((brand, index) => (
                <div
                  key={brand._id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <DollarLineIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {brand.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {brand.productCount} product{brand.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{brand.totalSales}</p>
                    <p className="text-xs text-gray-500">sales</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No brand data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h2>
          {analytics.categoryDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.categoryDistribution.map((category) => {
                const percentage = (
                  (category.productCount / analytics.totalProducts) *
                  100
                ).toFixed(1);
                return (
                  <div key={category._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-gray-600">
                        {category.productCount} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No category data yet</p>
          )}
        </div>

        {/* Price Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Price Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Price</span>
              <span className="text-2xl font-bold text-blue-600">
                {analytics.priceStats.avgPrice.toFixed(2)} TND
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">Minimum Price</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics.priceStats.minPrice.toFixed(2)} TND
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">Maximum Price</span>
              <span className="text-2xl font-bold text-purple-600">
                {analytics.priceStats.maxPrice.toFixed(2)} TND
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAnalytics;
