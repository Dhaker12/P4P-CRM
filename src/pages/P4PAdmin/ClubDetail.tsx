import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface Court {
  _id?: string;
  courtNumber: string;
  courtType: string;
  isAvailable: boolean;
  price: number | null;
  courtName: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Club {
  _id: string;
  name: string;
  logo: string;
  address: string;
  country: string;
  governorate?: string;
  contact?: {
    phone: string;
    email: string | null;
  };
  phone?: string; // Backwards compatibility
  location?: {
    lng: number | null;
    lat: number | null;
    url: string | null;
  };
  locationUrl?: string; // Backwards compatibility
  description: string;
  courts: Court[];
  tags: string[];
  facilities: string[];
  photos: string[];
  media?: string[];
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const deleteModal = useModal();

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/clubs/${id}`);
      setClub(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch club:", error);
      const errorMessage = error.response?.data?.message || "Failed to load club details.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/clubs/${id}`);
      deleteModal.closeModal();
      navigate("/p4p-admin/clubs");
    } catch (error) {
      console.error("Failed to delete club:", error);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading club details...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || "Club not found"}</p>
        <Link to="/p4p-admin/clubs" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`${club.name} | P4P Admin`} description={`Club details for ${club.name}`} />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/p4p-admin/clubs"
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{club.name}</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created on {new Date(club.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/p4p-admin/clubs/${club._id}/edit`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Club
          </Link>
          <button
            onClick={deleteModal.openModal}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo & Basic Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h2>
            
            {club.logo && (
              <div className="mb-6">
                <img
                  src={club.logo}
                  alt={club.name}
                  className="h-32 w-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Club Name</label>
                <p className="mt-1 text-gray-900 dark:text-white">{club.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                <p className="mt-1 text-gray-900 dark:text-white">{club.country || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <p className="mt-1 text-gray-900 dark:text-white">{club.contact?.phone || club.phone || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Courts</label>
                <p className="mt-1 text-gray-900 dark:text-white">{Array.isArray(club.courts) ? club.courts.length : 0}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                <p className="mt-1 text-gray-900 dark:text-white">{club.address}</p>
              </div>
              {club.locationUrl && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location URL</label>
                  <a
                    href={club.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-blue-600 hover:text-blue-700 dark:text-blue-400 break-all"
                  >
                    {club.locationUrl}
                  </a>
                </div>
              )}
              {club.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{club.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Courts Details */}
          {club.courts && club.courts.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Courts ({club.courts.length})
              </h2>
              <div className="space-y-4">
                {club.courts.map((court, idx) => (
                  <div
                    key={court._id || idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {court.courtName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        court.isAvailable 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {court.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Court #:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{court.courtNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{court.courtType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {court.price ? `${court.price} TND/hour` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {court.rating > 0 ? `${court.rating}/5` : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Court Photos */}
          {club.photos && club.photos.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Court Photos</h2>
              <div className="relative border border-gray-200 rounded-lg carouselFour dark:border-gray-800">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    el: ".swiper-pagination",
                    clickable: true,
                  }}
                  navigation={{
                    nextEl: ".swiper-button-next.next-style-two",
                    prevEl: ".swiper-button-prev.prev-style-two",
                  }}
                >
                  {club.photos.map((photo, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="overflow-hidden rounded-lg">
                        <img
                          src={photo}
                          alt={`Court ${idx + 1}`}
                          className="w-full h-96 object-cover rounded-lg"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-pagination"></div>
                </Swiper>

                {/* Navigation buttons */}
                <div className="swiper-button-prev prev-style-two">
                  <svg
                    className="w-auto h-auto stroke-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.25 6L9 12.25L15.25 18.5"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="swiper-button-next next-style-two">
                  <svg
                    className="stroke-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.75 19L15 12.75L8.75 6.5"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {club.tags && club.tags.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {club.tags.map((tag, idx) => (
                  <Badge key={idx} variant="light" color="info" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {club.facilities && club.facilities.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Facilities</h2>
              <div className="space-y-2">
                {club.facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
            Delete Club?
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to delete {club?.name}? This action cannot be undone and will permanently remove all club data.
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
              {actionLoading ? "Deleting..." : "Delete Club"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
