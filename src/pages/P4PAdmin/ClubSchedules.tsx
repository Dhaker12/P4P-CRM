import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import api from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import DatePicker from "../../components/form/date-picker";

interface Court {
  _id?: string;
  courtNumber: string;
  courtType: string;
  isAvailable: boolean;
  price: number | null;
  courtName: string;
  rating: number;
}

interface Club {
  _id: string;
  name: string;
  courts: Court[];
}

interface TimeSlot {
  time: string;
  endTime: string;
  hour: number;
  minute: number;
}

interface Booking {
  _id?: string;
  clubId: string;
  courtNumber: number;
  date: string;
  timeSlot: string;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  status: "booked" | "available";
  paymentStatus: "paid" | "unpaid";
  color?: string;
}

export default function ClubSchedules() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const bookingModal = useModal();
  const detailModal = useModal();
  const [selectedSlot, setSelectedSlot] = useState<{ slot: TimeSlot; court: number } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    playerName: "",
    playerEmail: "",
    playerPhone: "",
    paymentStatus: "unpaid" as "paid" | "unpaid",
  });

  // Load bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('clubBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  const bookingColors = ["danger", "success", "primary", "warning", "info"];

  // Generate time slots from 6:00 AM to 1:30 AM (next day) - 90 minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    const addSlot = (hour: number, minute: number) => {
      const endMinute = minute + 90;
      const endHour = hour + Math.floor(endMinute / 60);
      const finalEndMinute = endMinute % 60;
      
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        endTime: `${endHour.toString().padStart(2, "0")}:${finalEndMinute.toString().padStart(2, "0")}`,
        hour,
        minute,
      });
    };

    // From 6:00 AM to 11:30 PM (same day)
    let hour = 6;
    let minute = 0;
    while (hour < 24) {
      addSlot(hour, minute);
      minute += 90;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    }

    // From 12:00 AM to 1:30 AM (next day)
    hour = 0;
    minute = 0;
    while (hour < 2 || (hour === 1 && minute <= 30)) {
      addSlot(hour, minute);
      minute += 90;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) {
      fetchBookings();
    }
  }, [selectedClub, selectedDate]);

  const fetchClubs = async () => {
    try {
      const response = await api.get("/clubs");
      const sortedClubs = response.data.sort((a: Club, b: Club) =>
        a.name.localeCompare(b.name)
      );
      setClubs(sortedClubs);
      if (sortedClubs.length > 0) {
        setSelectedClub(sortedClubs[0]);
      }
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    }
  };

  const fetchBookings = async () => {
    if (!selectedClub) return;
    
    try {
      setLoading(true);
      // Don't need to do anything here since bookings are already loaded from localStorage
      // The filtering happens in getBookingForSlot
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setLoading(false);
    }
  };

  const getBookingForSlot = (timeSlot: string, courtNumber: number): Booking | undefined => {
    return bookings.find(
      (booking) =>
        booking.clubId === selectedClub?._id &&
        booking.date === selectedDate &&
        booking.timeSlot === timeSlot &&
        booking.courtNumber === courtNumber &&
        booking.status === "booked"
    );
  };

  const handleSlotClick = (slot: TimeSlot, court: number) => {
    const booking = getBookingForSlot(slot.time, court);
    if (booking) {
      // Show booking details
      setSelectedBooking(booking);
      detailModal.openModal();
      return;
    }
    // Open booking modal
    setSelectedSlot({ slot, court });
    setBookingForm({ 
      playerName: "", 
      playerEmail: "", 
      playerPhone: "",
      paymentStatus: "unpaid"
    });
    bookingModal.openModal();
  };

  const handleBooking = async () => {
    if (!selectedClub || !selectedSlot) return;

    try {
      const randomColor = bookingColors[Math.floor(Math.random() * bookingColors.length)];
      
      const newBooking: Booking = {
        _id: Date.now().toString(),
        clubId: selectedClub._id,
        courtNumber: selectedSlot.court,
        date: selectedDate,
        timeSlot: selectedSlot.slot.time,
        playerName: bookingForm.playerName,
        playerEmail: bookingForm.playerEmail,
        playerPhone: bookingForm.playerPhone,
        paymentStatus: bookingForm.paymentStatus,
        status: "booked",
        color: randomColor,
      };
      
      // Add new booking to state and localStorage
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      localStorage.setItem('clubBookings', JSON.stringify(updatedBookings));
      
      bookingModal.closeModal();
      setSelectedSlot(null);
      setBookingForm({
        playerName: "",
        playerEmail: "",
        playerPhone: "",
        paymentStatus: "unpaid",
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="Club Schedules & Availability | P4P Admin"
        description="Manage club court schedules and bookings"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Club Schedules & Availability
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and manage court bookings for all clubs
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Club Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Club
            </label>
            <select
              value={selectedClub?._id || ""}
              onChange={(e) => {
                const club = clubs.find((c) => c._id === e.target.value);
                setSelectedClub(club || null);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
            >
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <DatePicker
              id="booking-date"
              label="Select Date"
              defaultDate={selectedDate}
              minDate="today"
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  const date = selectedDates[0];
                  const formattedDate = date.toISOString().split("T")[0];
                  setSelectedDate(formattedDate);
                }
              }}
              placeholder="Select date"
            />
          </div>
        </div>
      </div>

      {/* Schedule Calendar Grid */}
      {selectedClub ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {selectedClub.name} - Court Schedule
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Click on available slots to book, or click on booked slots to view details
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-gray-600 dark:text-gray-400">
                Loading schedule...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800">
                      Time
                    </th>
                    {selectedClub.courts.map((court, i) => (
                      <th
                        key={court._id || i}
                        className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800"
                      >
                        {court.courtName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, idx) => (
                    <tr
                      key={slot.time}
                      className={idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-white/[0.02]"}
                    >
                      <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-t border-gray-200 dark:border-gray-800 bg-inherit">
                        <div>{slot.time}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{slot.endTime}</div>
                      </td>
                      {selectedClub.courts.map((court, i) => {
                        const courtNum = parseInt(court.courtNumber) || (i + 1);
                        const booking = getBookingForSlot(slot.time, courtNum);
                        const isBooked = !!booking;

                        return (
                          <td
                            key={court._id || i}
                            className="px-2 py-2 border-r border-t border-gray-200 dark:border-gray-800"
                          >
                            {isBooked && booking ? (
                              <button
                                onClick={() => handleSlotClick(slot, courtNum)}
                                className={`w-full rounded-lg p-3 text-left transition-all hover:shadow-md fc-bg-${booking.color} relative`}
                              >
                                {booking.paymentStatus === "unpaid" && (
                                  <div className="absolute top-1 right-1">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                                  </div>
                                )}
                                <div className="flex items-start gap-2">
                                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 fc-dot-${booking.color}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 dark:text-white truncate">
                                      {booking.playerName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                      90 min session
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSlotClick(slot, courtNum)}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-3 text-center transition-all hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
                              >
                                <div className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  Available
                                </div>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No clubs available. Please add a club first.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal.isOpen}
        onClose={bookingModal.closeModal}
        className="max-w-[500px] p-6 lg:p-8"
      >
        <div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Book Time Slot
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {selectedSlot && (
              <>
                {selectedSlot.slot.time} - {selectedSlot.slot.endTime} • {selectedClub?.name} Court {selectedSlot.court}
              </>
            )}
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Player Name
              </label>
              <input
                type="text"
                value={bookingForm.playerName}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, playerName: e.target.value })
                }
                placeholder="Enter player name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Player Email
              </label>
              <input
                type="email"
                value={bookingForm.playerEmail}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, playerEmail: e.target.value })
                }
                placeholder="Enter player email"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Player Phone (Optional)
              </label>
              <input
                type="tel"
                value={bookingForm.playerPhone}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, playerPhone: e.target.value })
                }
                placeholder="Enter player phone"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Status
              </label>
              <select
                value={bookingForm.paymentStatus}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, paymentStatus: e.target.value as "paid" | "unpaid" })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={bookingModal.closeModal}
              className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBooking}
              disabled={!bookingForm.playerName || !bookingForm.playerEmail}
              className="flex justify-center px-6 py-3 text-sm font-medium text-white rounded-lg bg-blue-600 shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Slot
            </button>
          </div>
        </div>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.closeModal}
        className="max-w-[500px] p-6 lg:p-8"
      >
        {selectedBooking && (
          <div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Booking Details
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              View booking information
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Player Name</label>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">{selectedBooking.playerName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Court</label>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">Court {selectedBooking.courtNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Time</label>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">{selectedBooking.timeSlot}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</label>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">90 minutes</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedBooking.paymentStatus === "paid" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {selectedBooking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">{selectedBooking.playerEmail}</p>
                  </div>
                  {selectedBooking.playerPhone && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">{selectedBooking.playerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={detailModal.closeModal}
                className="flex justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-white/[0.03]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
