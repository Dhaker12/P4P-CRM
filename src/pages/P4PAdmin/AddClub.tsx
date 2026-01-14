import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Checkbox from "../../components/form/input/Checkbox";

export default function AddClub() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const successModal = useModal();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    governorate: "",
    phone: "",
    locationUrl: "",
    description: "",
    courts: "",
    tags: "",
    facilities: [] as string[]
  });

  useEffect(() => {
    if (isEditMode) {
      fetchClub();
    }
  }, [id]);

  const fetchClub = async () => {
    try {
      const response = await api.get(`/clubs/${id}`);
      const club = response.data;
      setFormData({
        name: club.name || "",
        address: club.address || "",
        country: club.country || "",
        governorate: club.governorate || "",
        phone: club.contact?.phone || club.phone || "",
        locationUrl: club.location?.url || club.locationUrl || "",
        description: club.description || "",
        courts: Array.isArray(club.courts) ? club.courts.length.toString() : (club.courts?.toString() || ""),
        tags: club.tags?.join(", ") || "",
        facilities: club.facilities || []
      });
      // Set existing logo and photos
      if (club.logo) {
        setLogoPreview(club.logo);
      }
      if (club.photos && club.photos.length > 0) {
        setPhotoPreviews(club.photos);
      }
    } catch (error) {
      console.error("Failed to fetch club:", error);
      alert("Failed to load club details");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPhotoFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const availableFacilities = ["Parking", "Locker Rooms", "Showers", "Shop", "Cafeteria", "Pro Shop", "Massage"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.address || !formData.phone || !formData.courts) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      
      const clubTags = formData.tags
        ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        : [];

      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("courts", formData.courts);
      formDataToSend.append("locationUrl", formData.locationUrl);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("tags", JSON.stringify(clubTags));
      formDataToSend.append("facilities", JSON.stringify(formData.facilities));
      
      // Add logo file if present
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }
      
      // Add photo files if present
      photoFiles.forEach((file) => {
        formDataToSend.append("photos", file);
      });

      if (isEditMode) {
        await api.put(`/clubs/${id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/clubs", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      successModal.openModal();
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} club`);
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    navigate("/p4p-admin/clubs");
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? 'Edit' : 'Add'} Club | P4P Admin`}
        description={`${isEditMode ? 'Edit' : 'Create a new'} padel club`}
      />

      <div className="mb-6">
        <Link
          to="/p4p-admin/clubs"
          className="mb-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Clubs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? 'Edit Club' : 'Add New Club'}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isEditMode ? 'Update club information' : 'Create a new padel club in the platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
              Basic Information
            </h3>
            
            <div className="space-y-5">
              {/* Club Name */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Club Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter club name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter club address"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>

              {/* Country */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                >
                  <option value="">Select country</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="France">France</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
              </div>

              {/* Governorate */}
              {formData.country && (
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Governorate / Region / Province
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  >
                    <option value="">Select {formData.country === 'Tunisia' ? 'governorate' : formData.country === 'France' ? 'region' : 'province'}</option>
                    {formData.country === 'Tunisia' && (
                      <>
                        <option value="Tunis">Tunis</option>
                        <option value="Ariana">Ariana</option>
                        <option value="Ben Arous">Ben Arous</option>
                        <option value="Manouba">Manouba</option>
                        <option value="Nabeul">Nabeul</option>
                        <option value="Zaghouan">Zaghouan</option>
                        <option value="Bizerte">Bizerte</option>
                        <option value="Béja">Béja</option>
                        <option value="Jendouba">Jendouba</option>
                        <option value="Kef">Kef</option>
                        <option value="Siliana">Siliana</option>
                        <option value="Kairouan">Kairouan</option>
                        <option value="Kasserine">Kasserine</option>
                        <option value="Sidi Bouzid">Sidi Bouzid</option>
                        <option value="Sousse">Sousse</option>
                        <option value="Monastir">Monastir</option>
                        <option value="Mahdia">Mahdia</option>
                        <option value="Sfax">Sfax</option>
                        <option value="Gafsa">Gafsa</option>
                        <option value="Tozeur">Tozeur</option>
                        <option value="Kebili">Kebili</option>
                        <option value="Gabès">Gabès</option>
                        <option value="Medenine">Medenine</option>
                        <option value="Tataouine">Tataouine</option>
                      </>
                    )}
                    {formData.country === 'France' && (
                      <>
                        <option value="Île-de-France">Île-de-France</option>
                        <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
                        <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                        <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                        <option value="Occitanie">Occitanie</option>
                        <option value="Hauts-de-France">Hauts-de-France</option>
                        <option value="Grand Est">Grand Est</option>
                        <option value="Pays de la Loire">Pays de la Loire</option>
                        <option value="Bretagne">Bretagne</option>
                        <option value="Normandie">Normandie</option>
                        <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                        <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                        <option value="Corse">Corse</option>
                      </>
                    )}
                    {formData.country === 'Netherlands' && (
                      <>
                        <option value="Noord-Holland">Noord-Holland</option>
                        <option value="Zuid-Holland">Zuid-Holland</option>
                        <option value="Utrecht">Utrecht</option>
                        <option value="Gelderland">Gelderland</option>
                        <option value="Noord-Brabant">Noord-Brabant</option>
                        <option value="Limburg">Limburg</option>
                        <option value="Overijssel">Overijssel</option>
                        <option value="Groningen">Groningen</option>
                        <option value="Friesland">Friesland</option>
                        <option value="Drenthe">Drenthe</option>
                        <option value="Flevoland">Flevoland</option>
                        <option value="Zeeland">Zeeland</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Phone & Courts */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Phone number"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="fill-current text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M2 3.5C2 2.67157 2.67157 2 3.5 2H5.1584C5.71651 2 6.20452 2.37974 6.33471 2.91927L7.14142 6.24141C7.25375 6.70667 7.06129 7.19279 6.66437 7.45885L5.26555 8.42691C5.23823 8.44485 5.23568 8.45798 5.23651 8.46158C5.94925 10.3881 7.61193 12.0508 9.53842 12.7635C9.54202 12.7643 9.55515 12.7618 9.57309 12.7344L10.5411 11.3356C10.8072 10.9387 11.2933 10.7462 11.7586 10.8586L15.0807 11.6653C15.6203 11.7955 16 12.2835 16 12.8416V14.5C16 15.3284 15.3284 16 14.5 16H13C6.92487 16 2 11.0751 2 5V3.5Z" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Courts <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="courts"
                    value={formData.courts}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g. 4"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location URL */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  name="locationUrl"
                  value={formData.locationUrl}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Brief description of the club..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                />
              </div>

              {/* Club Logo */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Club Logo
                </label>
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-gray-700">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Facilities */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
                Tags & Features
              </h3>
              
              <div className="space-y-5">
                {/* Tags */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Indoor, Outdoor, Floodlights (comma separated)"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple tags with commas
                  </p>
                </div>

                {/* Facilities */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facilities
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableFacilities.map((facility) => (
                      <div key={facility} className="flex items-center">
                        <Checkbox
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          label={facility}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Court Photos Gallery */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Court Photos
                  </label>
                  <div className="space-y-3">
                    {photoPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {photoPreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview}
                              alt={`Court photo ${idx + 1}`}
                              className="h-24 w-full rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-gray-700">
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {photoPreviews.length > 0 ? 'Add More Photos' : 'Upload Court Photos'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotosChange}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB each. Select multiple files.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/p4p-admin/clubs")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Club" : "Create Club")}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={handleSuccessClose}
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
            Club {isEditMode ? 'Updated' : 'Created'} Successfully!
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            The club has been {isEditMode ? 'updated' : 'created'} and is now available in the platform.
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={handleSuccessClose}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 sm:w-auto"
            >
              Go to Clubs List
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
