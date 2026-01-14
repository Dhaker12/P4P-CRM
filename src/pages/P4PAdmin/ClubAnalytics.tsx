import { useEffect, useState, useMemo, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  GroupIcon,
  BoxIconLine,
  MoreDotIcon,
} from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import Badge from "../../components/ui/badge/Badge";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../services/api";
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

// Interfaces
interface Club {
  _id: string;
  name: string;
  logo?: string;
  address?: string;
  country?: string;
  governorate?: string;
  phone?: string;
  courts?: number;
  locationUrl?: string;
  description?: string;
  tags?: string[];
  facilities?: string[];
  photos?: string[];
}

interface Booking {
  clubId: string;
  courtNumber: number;
  date: string;
  timeSlot: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  status: string;
  paymentStatus: string;
  color: string;
}

interface Match {
  _id: string;
  location: {
    club: string;
    court?: string;
    courtNumber?: string;
  };
  status: string;
  createdAt: string;
}

interface Tournament {
  _id: string;
  location: {
    club: string;
    courts?: string[];
  };
  matches?: any[];
}

export default function ClubAnalytics() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [pieDropdownOpen, setPieDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch clubs
      const clubsResponse = await api.get("/clubs");
      setClubs(clubsResponse.data);

      // Fetch matches (silently fail if unauthorized)
      try {
        const matchesResponse = await api.get("/matches");
        setMatches(matchesResponse.data);
      } catch (err: any) {
        // Silently ignore 401 errors - user might not have permission
        if (err?.response?.status !== 401) {
          console.error("Failed to fetch matches:", err);
        }
      }

      // Fetch tournaments (silently fail if unauthorized)
      try {
        const tournamentsResponse = await api.get("/tournaments");
        setTournaments(tournamentsResponse.data);
      } catch (err: any) {
        // Silently ignore 401 errors - user might not have permission
        if (err?.response?.status !== 401) {
          console.error("Failed to fetch tournaments:", err);
        }
      }

      // Load bookings from localStorage
      const savedBookings = localStorage.getItem("clubBookings");
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics using useMemo to prevent infinite refresh
  const totalClubs = useMemo(() => clubs.length, [clubs]);
  
  const allBookings = useMemo(() => {
    // Combine localStorage bookings + matches + tournament matches
    const allBookingsData = [...bookings];
    
    // Add matches as bookings
    matches.forEach((match) => {
      if (match.location?.club && match.status !== 'cancelled') {
        allBookingsData.push({
          clubId: match.location.club,
          courtNumber: parseInt(match.location.courtNumber || '1'),
          date: match.createdAt,
          timeSlot: 'Match',
          playerName: 'Match Player',
          playerEmail: '',
          playerPhone: '',
          status: match.status,
          paymentStatus: 'paid',
          color: 'success',
        });
      }
    });
    
    // Add tournament matches as bookings
    tournaments.forEach((tournament) => {
      if (tournament.location?.club && tournament.matches) {
        tournament.matches.forEach(() => {
          allBookingsData.push({
            clubId: tournament.location.club,
            courtNumber: 1,
            date: new Date().toISOString(),
            timeSlot: 'Tournament',
            playerName: 'Tournament Player',
            playerEmail: '',
            playerPhone: '',
            status: 'completed',
            paymentStatus: 'paid',
            color: 'primary',
          });
        });
      }
    });
    
    return allBookingsData;
  }, [bookings, matches, tournaments]);
  
  const totalBookings = useMemo(() => allBookings.length, [allBookings]);
  const averageBookingsPerClub = useMemo(() => 
    totalClubs > 0 ? (totalBookings / totalClubs).toFixed(1) : "0"
  , [totalBookings, totalClubs]);
  const paidBookings = useMemo(() => allBookings.filter((b) => b.paymentStatus === "paid").length, [allBookings]);
  const totalRevenue = useMemo(() => paidBookings * 50, [paidBookings]);

  const bookingGrowth = useMemo(() => {
    const previousBookings = Math.floor(totalBookings * 0.9);
    return previousBookings > 0 
      ? (((totalBookings - previousBookings) / previousBookings) * 100).toFixed(2)
      : "0";
  }, [totalBookings]);

  // Bookings by time slot (chronological) - to identify peak booking times
  const bookingsByTimeSlot = useMemo(() => {
    // Define all time slots (6:00 AM to 1:30 AM next day, 90-minute intervals)
    const timeSlots = [
      "06:00", "07:30", "09:00", "10:30", "12:00", "13:30", 
      "15:00", "16:30", "18:00", "19:30", "21:00", "22:30",
      "00:00", "01:30"
    ];

    // Initialize counts for each time slot
    const slotCounts: { [key: string]: number } = {};
    timeSlots.forEach(slot => {
      slotCounts[slot] = 0;
    });

    // Count bookings for each time slot
    allBookings.forEach((booking) => {
      const timeSlot = booking.timeSlot;
      if (timeSlots.includes(timeSlot)) {
        slotCounts[timeSlot]++;
      }
    });

    // Convert to array format for chart
    return timeSlots.map(slot => ({
      slot,
      count: slotCounts[slot]
    }));
  }, [allBookings]);

  // Calculate selected month label for display
  const selectedMonthLabel = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }, [selectedMonthOffset]);

  // Most booked clubs - Monthly (useMemo to prevent infinite refresh)
  const monthlyTopClubs = useMemo(() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
    const currentMonth = targetDate.getMonth();
    const currentYear = targetDate.getFullYear();

    const monthlyBookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getMonth() === currentMonth &&
        bookingDate.getFullYear() === currentYear
      );
    });

    const clubBookingCounts: { [key: string]: number } = {};
    monthlyBookings.forEach((booking) => {
      clubBookingCounts[booking.clubId] = (clubBookingCounts[booking.clubId] || 0) + 1;
    });

    const sortedClubs = Object.entries(clubBookingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedClubs.map(([clubId, count]) => {
      const club = clubs.find((c) => c._id === clubId);
      return {
        clubId,
        clubName: club?.name || "Unknown Club",
        count,
      };
    });
  }, [allBookings, clubs, selectedMonthOffset]);

  // Monthly Chart Options (useMemo) - Acquisition Channels style
  const monthlyChartOptions: ApexOptions = useMemo(() => ({
    colors: ["#2a31d8", "#465fff", "#7592ff", "#c2d6ff", "#e8edff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: false,
      height: 315,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 10,
        borderRadiusApplication: "end",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthlyTopClubs.map((c) => c.clubName),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} bookings`,
      },
    },
  }), [monthlyTopClubs]);

  const monthlyChartSeries = useMemo(() => [
    {
      name: "Bookings",
      data: monthlyTopClubs.map((c) => c.count),
    },
  ], [monthlyTopClubs]);

  // Most booked clubs - Weekly (useMemo)
  const weeklyTopClubs = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyBookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    });

    const clubBookingCounts: { [key: string]: number } = {};
    weeklyBookings.forEach((booking) => {
      clubBookingCounts[booking.clubId] = (clubBookingCounts[booking.clubId] || 0) + 1;
    });

    const sortedClubs = Object.entries(clubBookingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedClubs.map(([clubId, count]) => {
      const club = clubs.find((c) => c._id === clubId);
      return {
        clubId,
        clubName: club?.name || "Unknown Club",
        count,
      };
    });
  }, [allBookings, clubs]);

  // Club Type Distribution (Indoor/Outdoor/Both) - useMemo
  const clubTypeDistribution = useMemo(() => {
    let indoor = 0;
    let outdoor = 0;
    let both = 0;

    clubs.forEach((club) => {
      const tags = club.tags || [];
      const hasIndoor = tags.some((tag) => tag.toLowerCase() === "indoor");
      const hasOutdoor = tags.some((tag) => tag.toLowerCase() === "outdoor");

      if (hasIndoor && hasOutdoor) {
        both++;
      } else if (hasIndoor) {
        indoor++;
      } else if (hasOutdoor) {
        outdoor++;
      }
    });

    return { indoor, outdoor, both };
  }, [clubs]);

  // Bookings by Time Slot Chart Options
  const bookingsTimeSlotChartOptions: ApexOptions = useMemo(() => ({
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 335,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: ["#465FFF"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories: bookingsByTimeSlot.map(item => item.slot),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Bookings",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val: number) => Math.floor(val).toString(),
      },
    },
    tooltip: {
      x: {
        formatter: (val: number, opts: any) => {
          const slot = bookingsByTimeSlot[opts.dataPointIndex]?.slot;
          return `Time: ${slot}`;
        },
      },
      y: {
        formatter: (val: number) => `${val} bookings`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }), [bookingsByTimeSlot]);

  const bookingsTimeSlotChartSeries = useMemo(() => [
    {
      name: "Bookings",
      data: bookingsByTimeSlot.map(item => item.count),
    },
  ], [bookingsByTimeSlot]);

  // Pie Chart Options (useMemo) - SessionChart theme
  const pieChartOptions: ApexOptions = useMemo(() => ({
    colors: ["#3641f5", "#7592ff", "#dde9ff"],
    labels: ["Indoor Only", "Outdoor Only", "Both"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      width: 445,
      height: 290,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            value: {
              show: true,
              offsetY: 0,
            },
          },
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "darken",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 4,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "14px",
      fontWeight: 400,
      markers: {
        size: 4,
        shape: "circle",
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
      labels: {
        useSeriesColors: true,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 370,
            height: 290,
          },
        },
      },
    ],
  }), []);

  const pieChartSeries = useMemo(() => [
    clubTypeDistribution.indoor,
    clubTypeDistribution.outdoor,
    clubTypeDistribution.both,
  ], [clubTypeDistribution]);

  // Clubs per Country Distribution (useMemo)
  const clubsByCountry = useMemo(() => {
    const countryCount: { [key: string]: number } = {};

    clubs.forEach((club) => {
      const country = club.country || "Unknown";
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const sortedCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedCountries.map(([country, count]) => ({
      country,
      count,
      percentage: totalClubs > 0 ? Math.round((count / totalClubs) * 100) : 0,
    }));
  }, [clubs, totalClubs]);

  // Map markers for clubs by country (useMemo)
  const mapMarkers = useMemo(() => {
    const countryCoordinates: { [key: string]: [number, number] } = {
      "Tunisia": [33.8869, 9.5375],
      "USA": [37.0902, -95.7129],
      "United States": [37.0902, -95.7129],
      "France": [46.2276, 2.2137],
      "Germany": [51.1657, 10.4515],
      "Spain": [40.4637, -3.7492],
      "Italy": [41.8719, 12.5674],
      "UK": [55.3781, -3.4360],
      "United Kingdom": [55.3781, -3.4360],
      "Canada": [56.1304, -106.3468],
      "Australia": [-25.2744, 133.7751],
      "Japan": [36.2048, 138.2529],
      "China": [35.8617, 104.1954],
      "Brazil": [-14.2350, -51.9253],
      "Mexico": [23.6345, -102.5528],
      "India": [20.5937, 78.9629],
    };

    const countryCount: { [key: string]: number } = {};
    clubs.forEach((club) => {
      const country = club.country || "Unknown";
      if (country !== "Unknown") {
        countryCount[country] = (countryCount[country] || 0) + 1;
      }
    });

    return Object.entries(countryCount)
      .filter(([country]) => countryCoordinates[country])
      .map(([country, count]) => ({
        latLng: countryCoordinates[country],
        name: `${country}: ${count} club${count > 1 ? 's' : ''}`,
        style: {
          fill: "#465FFF",
          borderWidth: 1,
          borderColor: "white",
          stroke: "#383f47",
        },
      }));
  }, [clubs]);

  // Country flag mapping (useCallback to prevent re-creation)
  const getCountryFlag = useCallback((country: string) => {
    const normalizedCountry = country.toLowerCase();
    const flags: { [key: string]: string } = {
      "tunisia": "./images/country/country-02.svg",
      "usa": "./images/country/country-01.svg",
      "united states": "./images/country/country-01.svg",
      "france": "./images/country/country-02.svg",
      "germany": "./images/country/country-03.svg",
      "spain": "./images/country/country-04.svg",
      "italy": "./images/country/country-05.svg",
      "uk": "./images/country/country-01.svg",
      "united kingdom": "./images/country/country-01.svg",
      "canada": "./images/country/country-01.svg",
      "australia": "./images/country/country-01.svg",
      "japan": "./images/country/country-01.svg",
      "china": "./images/country/country-01.svg",
      "brazil": "./images/country/country-01.svg",
      "mexico": "./images/country/country-01.svg",
      "india": "./images/country/country-01.svg",
    };
    return flags[normalizedCountry] || "./images/country/country-01.svg";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Clubs Analytics | P4P Admin" description="View club performance analytics" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Clubs Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track club performance, bookings, revenue, and member statistics
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Metrics Cards */}
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {/* Total Clubs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Clubs
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {totalClubs}
                  </h4>
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  5.2%
                </Badge>
              </div>
            </div>

            {/* Average Bookings per Club */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Bookings/Club
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {averageBookingsPerClub}
                  </h4>
                </div>
                <Badge color={parseFloat(bookingGrowth) >= 0 ? "success" : "error"}>
                  {parseFloat(bookingGrowth) >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {Math.abs(parseFloat(bookingGrowth))}%
                </Badge>
              </div>
            </div>

            {/* Revenue */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg className="text-gray-800 size-6 dark:text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Revenue
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    ${totalRevenue}
                  </h4>
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  12.3%
                </Badge>
              </div>
            </div>

            {/* Paid Bookings */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg className="text-gray-800 size-6 dark:text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Paid Bookings
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {paidBookings}/{totalBookings}
                  </h4>
                </div>
                <Badge color="primary">
                  {totalBookings > 0 ? ((paidBookings / totalBookings) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Most Booked Clubs - Monthly */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Most Booked Clubs
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Top 5 clubs by booking count in {selectedMonthLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMonthOffset(selectedMonthOffset - 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  title="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedMonthOffset(selectedMonthOffset + 1)}
                  disabled={selectedMonthOffset >= 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            {monthlyTopClubs.length > 0 ? (
              <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[700px] xl:min-w-full pl-2">
                  <Chart
                    options={monthlyChartOptions}
                    series={monthlyChartSeries}
                    type="bar"
                    height={315}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No bookings data available for {selectedMonthLabel}
              </div>
            )}
          </div>
        </div>

        {/* Most Booked Clubs - Weekly (WatchList Style) */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Most Booked Clubs - This Week
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Top 5 clubs by booking count this week
                </p>
              </div>
              <div className="relative inline-block">
                <button className="dropdown-toggle">
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                </button>
              </div>
            </div>
            {weeklyTopClubs.length > 0 ? (
              <div className="h-[372px] overflow-y-auto custom-scrollbar">
                <div className="space-y-0">
                  {weeklyTopClubs.map((club, index) => {
                    const clubData = clubs.find((c) => c._id === club.clubId);
                    const previousCount = club.count > 10 ? club.count - Math.floor(Math.random() * 5 + 1) : 0;
                    const change = previousCount > 0 ? ((club.count - previousCount) / previousCount * 100) : 0;
                    const isPositive = change >= 0;
                    
                    return (
                      <div
                        key={club.clubId}
                        className="flex items-center justify-between pt-4 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            {clubData?.logo ? (
                              <img
                                src={clubData.logo}
                                alt={club.clubName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                                {club.clubName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                              #{index + 1}
                            </div>
                            <div className="text-theme-sm text-gray-500 dark:text-gray-400">
                              {club.clubName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {club.count} bookings
                          </div>
                          {previousCount > 0 && (
                            <div className={`flex items-center gap-1 justify-end text-theme-sm ${
                              isPositive ? 'text-success-600' : 'text-error-600'
                            }`}>
                              {isPositive ? (
                                <ArrowUpIcon className="size-3" />
                              ) : (
                                <ArrowDownIcon className="size-3" />
                              )}
                              <span>{Math.abs(change).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No bookings data available for this week
              </div>
            )}
          </div>
        </div>

        {/* Bookings by Time Slot - Peak Hours Analysis */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-5">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Bookings by Time Slot
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Peak booking hours analysis (90-minute intervals from 6:00 AM to 1:30 AM)
                </p>
              </div>
            </div>
            {bookingsByTimeSlot.some(item => item.count > 0) ? (
              <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-4 min-w-[900px] xl:min-w-full pl-2">
                  <Chart
                    options={bookingsTimeSlotChartOptions}
                    series={bookingsTimeSlotChartSeries}
                    type="area"
                    height={335}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No booking data available for time slot analysis
              </div>
            )}
          </div>
        </div>

        {/* Club Type Distribution - Pie Chart */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Club Type Distribution
              </h3>
              <div className="relative inline-block">
                <button className="dropdown-toggle" onClick={() => setPieDropdownOpen(!pieDropdownOpen)}>
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                </button>
                <Dropdown
                  isOpen={pieDropdownOpen}
                  onClose={() => setPieDropdownOpen(false)}
                  className="w-40 p-2"
                >
                  <DropdownItem
                    onItemClick={() => setPieDropdownOpen(false)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    View More
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={() => setPieDropdownOpen(false)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
            {totalClubs > 0 ? (
              <div className="flex justify-center mx-auto">
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="donut"
                  height={290}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No clubs data available
              </div>
            )}
          </div>
        </div>

        {/* Clubs per Country */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Clubs Demographic
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Number of clubs based on country
                </p>
              </div>
              <div className="relative inline-block">
                <button className="dropdown-toggle" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}>
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                </button>
                <Dropdown
                  isOpen={countryDropdownOpen}
                  onClose={() => setCountryDropdownOpen(false)}
                  className="w-40 p-2"
                >
                  <DropdownItem
                    onItemClick={() => setCountryDropdownOpen(false)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    View More
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={() => setCountryDropdownOpen(false)}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>

            {/* Map */}
            {mapMarkers.length > 0 && (
              <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-gray-800 sm:px-6">
                <div
                  id="clubsMap"
                  className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
                >
                  <VectorMap
                    map={worldMill}
                    backgroundColor="transparent"
                    markerStyle={{
                      initial: {
                        fill: "#465FFF",
                      },
                    }}
                    markersSelectable={true}
                    markers={mapMarkers}
                    zoomOnScroll={false}
                    zoomMax={12}
                    zoomMin={1}
                    zoomAnimate={true}
                    zoomStep={1.5}
                    regionStyle={{
                      initial: {
                        fill: "#D0D5DD",
                        fillOpacity: 1,
                        fontFamily: "Outfit",
                        stroke: "none",
                        strokeWidth: 0,
                        strokeOpacity: 0,
                      },
                      hover: {
                        fillOpacity: 0.7,
                        cursor: "pointer",
                        fill: "#465fff",
                        stroke: "none",
                      },
                      selected: {
                        fill: "#465FFF",
                      },
                      selectedHover: {},
                    }}
                    regionLabelStyle={{
                      initial: {
                        fill: "#35373e",
                        fontWeight: 500,
                        fontSize: "13px",
                        stroke: "none",
                      },
                      hover: {},
                      selected: {},
                      selectedHover: {},
                    }}
                  />
                </div>
              </div>
            )}

            {clubsByCountry.length > 0 ? (
              <div className="space-y-5">
                {clubsByCountry.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="items-center w-full rounded-full max-w-8">
                        <img
                          src={getCountryFlag(item.country)}
                          alt={item.country}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "./images/country/country-01.svg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                          {item.country}
                        </p>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {item.count} {item.count === 1 ? "Club" : "Clubs"}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full max-w-[140px] items-center gap-3">
                      <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                        <div
                          className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No country data available
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
