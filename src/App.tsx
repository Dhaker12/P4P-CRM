import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { restoreAuth } from "./redux/slices/authSlice";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import P4PDashboard from "./pages/Dashboard/P4P";
import Ecommerce from "./pages/Dashboard/Ecommerce";
import Stocks from "./pages/Dashboard/Stocks";
import Crm from "./pages/Dashboard/Crm";
import Marketing from "./pages/Dashboard/Marketing";
import Analytics from "./pages/Dashboard/Analytics";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Carousel from "./pages/UiElements/Carousel";
import Maintenance from "./pages/OtherPage/Maintenance";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Pagination from "./pages/UiElements/Pagination";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import ButtonsGroup from "./pages/UiElements/ButtonsGroup";
import Notifications from "./pages/UiElements/Notifications";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import PieChart from "./pages/Charts/PieChart";
import Invoices from "./pages/Invoices";
import ComingSoon from "./pages/OtherPage/ComingSoon";
import FileManager from "./pages/FileManager";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import DataTables from "./pages/Tables/DataTables";
import PricingTables from "./pages/PricingTables";
import Faqs from "./pages/Faqs";
import Chats from "./pages/Chat/Chats";
import FormElements from "./pages/Forms/FormElements";
import FormLayout from "./pages/Forms/FormLayout";
import Blank from "./pages/Blank";
import EmailInbox from "./pages/Email/EmailInbox";
import EmailDetails from "./pages/Email/EmailDetails";

import TaskKanban from "./pages/Task/TaskKanban";
import BreadCrumb from "./pages/UiElements/BreadCrumb";
import Cards from "./pages/UiElements/Cards";
import Dropdowns from "./pages/UiElements/Dropdowns";
import Links from "./pages/UiElements/Links";
import Lists from "./pages/UiElements/Lists";
import Popovers from "./pages/UiElements/Popovers";
import Progressbar from "./pages/UiElements/Progressbar";
import Ribbons from "./pages/UiElements/Ribbons";
import Spinners from "./pages/UiElements/Spinners";
import Tabs from "./pages/UiElements/Tabs";
import Tooltips from "./pages/UiElements/Tooltips";
import Modals from "./pages/UiElements/Modals";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import TwoStepVerification from "./pages/AuthPages/TwoStepVerification";
import Success from "./pages/OtherPage/Success";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TaskList from "./pages/Task/TaskList";
import Saas from "./pages/Dashboard/Saas";
import PlayersManagement from "./pages/P4PAdmin/PlayersManagement";
import AddPlayer from "./pages/P4PAdmin/AddPlayer";
import PlayerDetail from "./pages/P4PAdmin/PlayerDetail";
import PlayersAnalytics from "./pages/P4PAdmin/PlayersAnalytics";
import ProductsManagement from "./pages/P4PAdmin/ProductsManagement";
import BrandsManagement from "./pages/P4PAdmin/BrandsManagement";
import CategoriesManagement from "./pages/P4PAdmin/CategoriesManagement";
import CouponsManagement from "./pages/P4PAdmin/CouponsManagement";
import MarketplaceAnalytics from "./pages/P4PAdmin/MarketplaceAnalytics";
import CoachesManagement from "./pages/P4PAdmin/CoachesManagement";
import ClubOwnersManagement from "./pages/P4PAdmin/ClubOwnersManagement";
import AddClubOwner from "./pages/P4PAdmin/AddClubOwner";
import ClubsManagement from "./pages/P4PAdmin/ClubsManagement";
import AddClub from "./pages/P4PAdmin/AddClub";
import ClubDetail from "./pages/P4PAdmin/ClubDetail";
import ClubSchedules from "./pages/P4PAdmin/ClubSchedules";
import ClubAnalytics from "./pages/P4PAdmin/ClubAnalytics";

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore auth from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    // Always call restoreAuth to sync localStorage with Redux
    dispatch(restoreAuth());
    
    // Mark as initialized after a brief delay to ensure Redux is updated
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Show loading while restoring auth
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - Protected */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "superAdmin", "clubAdmin"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<P4PDashboard />} />
            <Route path="/dashboard/p4p" element={<P4PDashboard />} />
            <Route path="/dashboard/ecommerce" element={<Ecommerce />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/crm" element={<Crm />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/saas" element={<Saas />} />

            {/* P4P Admin - User Management */}
            <Route path="/p4p-admin/users/players" element={<PlayersManagement />} />
            <Route path="/p4p-admin/users/players/add" element={<AddPlayer />} />
            <Route path="/p4p-admin/users/players/analytics" element={<PlayersAnalytics />} />
            <Route path="/p4p-admin/users/players/:id" element={<PlayerDetail />} />
            <Route path="/p4p-admin/users/coaches" element={<CoachesManagement />} />
            <Route path="/p4p-admin/users/club-owners" element={<ClubOwnersManagement />} />
            <Route path="/p4p-admin/users/club-owners/add" element={<AddClubOwner />} />

            {/* P4P Admin - Clubs Management */}
            <Route path="/p4p-admin/clubs" element={<ClubsManagement />} />
            <Route path="/p4p-admin/clubs/add" element={<AddClub />} />
            <Route path="/p4p-admin/clubs/:id" element={<ClubDetail />} />
            <Route path="/p4p-admin/clubs/:id/edit" element={<AddClub />} />
            <Route path="/p4p-admin/clubs/schedules" element={<ClubSchedules />} />
            <Route path="/p4p-admin/clubs/analytics" element={<ClubAnalytics />} />

            {/* P4P Admin - Marketplace */}
            <Route path="/p4p-admin/marketplace/products" element={<ProductsManagement />} />
            <Route path="/p4p-admin/marketplace/brands" element={<BrandsManagement />} />
            <Route path="/p4p-admin/marketplace/categories" element={<CategoriesManagement />} />
            <Route path="/p4p-admin/marketplace/coupons" element={<CouponsManagement />} />
            <Route path="/p4p-admin/marketplace/analytics" element={<MarketplaceAnalytics />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/faq" element={<Faqs />} />
            <Route path="/pricing-tables" element={<PricingTables />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/form-layout" element={<FormLayout />} />

            {/* Applications */}
            <Route path="/chat" element={<Chats />} />

            <Route path="/task-list" element={<TaskList />} />
            <Route path="/task-kanban" element={<TaskKanban />} />
            <Route path="/file-manager" element={<FileManager />} />

            {/* Email */}

            <Route path="/inbox" element={<EmailInbox />} />
            <Route path="/inbox-details" element={<EmailDetails />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/data-tables" element={<DataTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/breadcrumb" element={<BreadCrumb />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-group" element={<ButtonsGroup />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/dropdowns" element={<Dropdowns />} />
            <Route path="/images" element={<Images />} />
            <Route path="/links" element={<Links />} />
            <Route path="/list" element={<Lists />} />
            <Route path="/modals" element={<Modals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pagination" element={<Pagination />} />
            <Route path="/popovers" element={<Popovers />} />
            <Route path="/progress-bar" element={<Progressbar />} />
            <Route path="/ribbons" element={<Ribbons />} />
            <Route path="/spinners" element={<Spinners />} />
            <Route path="/tabs" element={<Tabs />} />
            <Route path="/tooltips" element={<Tooltips />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/pie-chart" element={<PieChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/two-step-verification"
            element={<TwoStepVerification />}
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/success" element={<Success />} />
          <Route path="/five-zero-zero" element={<FiveZeroZero />} />
          <Route path="/five-zero-three" element={<FiveZeroThree />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </Router>
    </>
  );
}
