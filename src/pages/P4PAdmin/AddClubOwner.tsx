import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Radio from "../../components/form/input/Radio";
import Checkbox from "../../components/form/input/Checkbox";
import DatePicker from "../../components/form/date-picker";

export default function AddClubOwner() {
  const navigate = useNavigate();
  const successModal = useModal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Club Owner Personal Info
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    birthday: "",
    
    // Club Information
    clubName: "",
    clubAddress: "",
    clubPhone: "",
    clubLocationUrl: "",
    clubDescription: "",
    clubCourts: "",
    clubTags: "",
    clubFacilities: [] as string[],
    
    acceptTerms: false
  });

  const availableFacilities = ["Parking", "Locker Rooms", "Showers", "Shop", "Cafeteria", "Pro Shop", "Massage"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptTerms: checked
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      clubFacilities: prev.clubFacilities.includes(facility)
        ? prev.clubFacilities.filter(f => f !== facility)
        : [...prev.clubFacilities, facility]
    }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert("Please fill in all required personal fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!formData.gender) {
      alert("Please select a gender");
      return;
    }

    if (!formData.clubName || !formData.clubAddress || !formData.clubPhone || !formData.clubCourts) {
      alert("Please fill in all required club fields");
      return;
    }

    if (!formData.acceptTerms) {
      alert("You must accept the terms and conditions");
      return;
    }
    
    try {
      setLoading(true);
      
      // First, create the club owner user account
      const userResponse = await api.post("/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        role: "clubAdmin"
      });

      // Then, create the club
      const clubTags = formData.clubTags
        ? formData.clubTags.split(",").map(tag => tag.trim()).filter(tag => tag)
        : [];

      await api.post("/clubs", {
        name: formData.clubName,
        address: formData.clubAddress,
        phone: formData.clubPhone,
        locationUrl: formData.clubLocationUrl,
        description: formData.clubDescription,
        courts: parseInt(formData.clubCourts),
        tags: clubTags,
        facilities: formData.clubFacilities
      });

      successModal.openModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create club owner");
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    navigate("/p4p-admin/users/club-owners");
  };

  return (
    <>
      <PageMeta
        title="Add Club Owner | P4P Admin"
        description="Create a new club owner account with club details"
      />

      <div className="mb-6">
        <Link
          to="/p4p-admin/users/club-owners"
          className="mb-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Club Owners
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Add New Club Owner
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a new club owner account and associated club
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
              Owner Personal Information
            </h3>
            
            <div className="space-y-5">
              {/* First Name & Last Name Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phone & Birthday Row */}
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
                      placeholder="Enter phone number"
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
                  <DatePicker
                    id="owner-birthday-picker"
                    label="Birthday"
                    placeholder="Select birthday"
                    onChange={(dates) => {
                      if (dates && dates.length > 0) {
                        const selectedDate = dates[0];
                        const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
                        setFormData(prev => ({
                          ...prev,
                          birthday: formattedDate
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="fill-current text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.95615 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.95615 17.5 0.833008 16.3769 0.833008 15V5Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99967 9.81615L17.855 4.31734C18.2321 4.05341 18.7517 4.1451 19.0156 4.52215C19.2795 4.89919 19.1878 5.4188 18.8108 5.68272L10.4775 11.5161C10.1907 11.7169 9.80862 11.7169 9.52185 11.5161L1.1885 5.68272C0.811454 5.4188 0.719788 4.89919 0.983719 4.52215Z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Gender - Radio Buttons */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <Radio
                    id="owner-male"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleGenderChange}
                    label="Male"
                  />
                  <Radio
                    id="owner-female"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleGenderChange}
                    label="Female"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Enter password (min. 8 characters)"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="fill-current text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.66699 7.5V5.83333C6.66699 4.94928 7.01818 4.10143 7.64331 3.47631C8.26843 2.85119 9.11627 2.5 10.0003 2.5C10.8844 2.5 11.7322 2.85119 12.3573 3.47631C12.9825 4.10143 13.3337 4.94928 13.3337 5.83333V7.5C13.7757 7.5 14.1997 7.67559 14.5123 7.98816C14.8248 8.30072 15.0003 8.72464 15.0003 9.16667V15.8333C15.0003 16.2754 14.8248 16.6993 14.5123 17.0118C14.1997 17.3244 13.7757 17.5 13.3337 17.5H6.66699C6.22496 17.5 5.80104 17.3244 5.48848 17.0118C5.17591 16.6993 5.00033 16.2754 5.00033 15.8333V9.16667C5.00033 8.72464 5.17591 8.30072 5.48848 7.98816C5.80104 7.67559 6.22496 7.5 6.66699 7.5ZM11.667 7.5V5.83333C11.667 5.39131 11.4914 4.96738 11.1788 4.65482C10.8663 4.34226 10.4423 4.16667 10.0003 4.16667C9.55829 4.16667 9.13437 4.34226 8.82181 4.65482C8.50925 4.96738 8.33366 5.39131 8.33366 5.83333V7.5H11.667Z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Confirm password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="fill-current text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.66699 7.5V5.83333C6.66699 4.94928 7.01818 4.10143 7.64331 3.47631C8.26843 2.85119 9.11627 2.5 10.0003 2.5C10.8844 2.5 11.7322 2.85119 12.3573 3.47631C12.9825 4.10143 13.3337 4.94928 13.3337 5.83333V7.5C13.7757 7.5 14.1997 7.67559 14.5123 7.98816C14.8248 8.30072 15.0003 8.72464 15.0003 9.16667V15.8333C15.0003 16.2754 14.8248 16.6993 14.5123 17.0118C14.1997 17.3244 13.7757 17.5 13.3337 17.5H6.66699C6.22496 17.5 5.80104 17.3244 5.48848 17.0118C5.17591 16.6993 5.00033 16.2754 5.00033 15.8333V9.16667C5.00033 8.72464 5.17591 8.30072 5.48848 7.98816C5.80104 7.67559 6.22496 7.5 6.66699 7.5ZM11.667 7.5V5.83333C11.667 5.39131 11.4914 4.96738 11.1788 4.65482C10.8663 4.34226 10.4423 4.16667 10.0003 4.16667C9.55829 4.16667 9.13437 4.34226 8.82181 4.65482C8.50925 4.96738 8.33366 5.39131 8.33366 5.83333V7.5H11.667Z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Club Information */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
                Club Information
              </h3>
              
              <div className="space-y-5">
                {/* Club Name */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Club Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleChange}
                    required
                    placeholder="Enter club name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>

                {/* Club Address */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clubAddress"
                    value={formData.clubAddress}
                    onChange={handleChange}
                    required
                    placeholder="Enter club address"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>

                {/* Club Phone & Courts */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Club Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="clubPhone"
                      value={formData.clubPhone}
                      onChange={handleChange}
                      required
                      placeholder="Club phone"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Courts <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="clubCourts"
                      value={formData.clubCourts}
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
                    name="clubLocationUrl"
                    value={formData.clubLocationUrl}
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
                    name="clubDescription"
                    value={formData.clubDescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of the club..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="clubTags"
                    value={formData.clubTags}
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
                          checked={formData.clubFacilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          label={facility}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
                Terms & Conditions
              </h3>
              
              <div className="space-y-4">
                <Checkbox
                  checked={formData.acceptTerms}
                  onChange={handleCheckboxChange}
                  label="I accept all Terms, Privacy Policy and Fees"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By creating this club owner account, you confirm acceptance of the platform's terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/p4p-admin/users/club-owners")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Club Owner"}
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
            Club Owner Created Successfully!
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            The club owner account and associated club have been created successfully.
          </p>
          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              onClick={handleSuccessClose}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 sm:w-auto"
            >
              Go to Club Owners List
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
