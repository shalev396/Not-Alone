import ContributePage from "./pages/Contribute";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import NewPost from "./pages/NewEatup";
import SignUp from "./pages/Signup";
import Tos from "./pages/Tos";
import YourRights from "./pages/YourRights";
import Terms from "./pages/Terms";
import ContactUs from "./pages/ContactUs";
import Social from "./pages/Social";
import { Provider } from "react-redux";
import store from "./Redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import RequestForm from "./pages/RequestForm";
import CreatePost from "./pages/CreatePost";
import PendingPage from "./pages/PendingPage";
import AdminQueue from "./pages/AdminQueue";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "./api/api";
import ChannelPage from "./pages/ChannelPage";
import MyEatUps from "./pages/MyEatUps";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import VouchersGrid from "./pages/VouchersGrid";
import NewDonation from "./pages/NewDonation";
import MyDonations from "./pages/MyDonations";
import CreateCity from "./pages/CreateCity";
import AdminCityQueue from "./pages/AdminCityQueue";
import MyRequests from "./pages/MyRequests";
import CityRequestQueue from "./pages/CityRequestQueue";
import CityUserApprovalQueue from "./pages/CityUserApprovalQueue";
import JoinCityRequest from "./pages/JoinCityRequest";
import DonationStatus from "./pages/DonationStatus";
import DonationAssignment from "./pages/DonationAssignment";
import DonationControlPanel from "./pages/DonationControlPanel";
import SoldierJoinCity from "./pages/SoldierJoinCity";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordVerify from "./pages/ResetPasswordVerify";

// Public routes that don't need protection
// const publicRoutes = [
//   "/",
//   "/login",
//   "/signup",
//   "/pending",
//   "/termofservice",
//   "/terms",
//   "/contact",
// ];

function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const fetchUser = async () => {
        try {
          const response = await api.get("/users/me");
          console.log(response.data);
          // alert(JSON.stringify(response.data));
          dispatch({ type: "user/setUser", payload: response.data.user });
          dispatch({ type: "auth/login", payload: { token } });
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          sessionStorage.removeItem("token");
          dispatch({ type: "auth/logout" });
        }
      };
      fetchUser();
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/2fa" element={<TwoFactorAuth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password-verify" element={<ResetPasswordVerify />} />
      <Route path="/pending" element={<PendingPage />} />
      <Route path="/termofservice" element={<Tos />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/donation-status/:donationId" element={<DonationStatus />} />

      {/* Protected Routes */}
      <Route
        path="/contribute"
        element={
          <ProtectedRoute>
            <ContributePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logout"
        element={
          <ProtectedRoute>
            <Logout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-post"
        element={
          <ProtectedRoute>
            <NewPost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rights"
        element={
          <ProtectedRoute>
            <YourRights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/social"
        element={
          <ProtectedRoute>
            <Social />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/queue"
        element={
          <ProtectedRoute>
            <AdminQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-eatups"
        element={
          <ProtectedRoute>
            <MyEatUps />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage mode="Donations" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home/donations"
        element={
          <ProtectedRoute>
            <HomePage mode="Donations" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home/residences"
        element={
          <ProtectedRoute>
            <HomePage mode="Residences" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home/eatup"
        element={
          <ProtectedRoute>
            <HomePage mode="EatUp" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel/:channelId"
        element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/RequestForm"
        element={
          <ProtectedRoute>
            <RequestForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Vouchers"
        element={
          <ProtectedRoute>
            <VouchersGrid />
          </ProtectedRoute>
        }
      />
      {/* TODO: ASK nathan*/}
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost onPostCreated={() => {}} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-donation"
        element={
          <ProtectedRoute>
            <NewDonation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-donations"
        element={
          <ProtectedRoute>
            <MyDonations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-city"
        element={
          <ProtectedRoute>
            <CreateCity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cities"
        element={
          <ProtectedRoute>
            <AdminCityQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute>
            <MyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/city-requests"
        element={
          <ProtectedRoute>
            <CityRequestQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/city-approval"
        element={
          <ProtectedRoute>
            <CityUserApprovalQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/join-city"
        element={
          <ProtectedRoute>
            <JoinCityRequest />
          </ProtectedRoute>
        }
      />
      {/* fix later */}
      {/* <Route
        path="/donation-status/:donationId"
        element={
          <ProtectedRoute>
            <DonationStatus />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/donation-assignment"
        element={
          <ProtectedRoute>
            <DonationAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donation-control-panel"
        element={
          <ProtectedRoute>
            <DonationControlPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donation-requests"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/soldier-join-city"
        element={
          <ProtectedRoute>
            <SoldierJoinCity />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}

export default function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </>
  );
}
