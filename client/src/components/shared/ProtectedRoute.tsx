import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import {
  routeListSoldier,
  routeListMunicipality,
  routeListDonor,
  routeListOrganization,
  routeListBusiness,
  routeListAdmin,
} from "./navigation/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const currentPath = window.location.pathname;
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if a path is in a route list
  const isPathInRouteList = (routeList: any[]): boolean => {
    return routeList.some((route) => {
      if ("routes" in route) {
        // Handle admin sections that contain nested routes
        return route.routes?.some((r: any) => r.href === currentPath);
      }
      return route.href === currentPath;
    });
  };

  // Function to get allowed routes based on user type
  const getAllowedRoutes = (userType: string) => {
    // const commonRoutes = ["/", "/profile", "/logout"];

    switch (userType?.toLowerCase()) {
      case "admin":
        return routeListAdmin;
      case "soldier":
        return routeListSoldier;
      case "municipality":
        return routeListMunicipality;
      case "donor":
        return routeListDonor;
      case "organization":
        return routeListOrganization;
      case "business":
        return routeListBusiness;
      default:
        return [];
    }
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await api.get("/users/me");
      dispatch({ type: "user/setUser", payload: response.data.user });
      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      sessionStorage.removeItem("token");
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        navigate("/login");
        return;
      }

      // If we have a token but no user data (after refresh)
      if (token && !user.email) {
        const success = await fetchUserData();
        if (!success) {
          navigate("/login");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user.email) {
      console.log("user.email", user);
      navigate("/login");
      return;
    }

    if (!isLoading && user.email) {
      const allowedRoutes = getAllowedRoutes(user.type);
      const isAllowed =
        isPathInRouteList(allowedRoutes) ||
        currentPath === "/" ||
        currentPath === "/profile" ||
        currentPath === "/logout" ||
        currentPath.startsWith("/channel/");

      // If the current path is not allowed for the user's role, redirect to home
      if (!isAllowed) {
        console.log(`Access denied: ${user.type} cannot access ${currentPath}`);
        navigate("/");
      }
    }
  }, [currentPath, user.type, user.email, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, don't render anything
  if (!user.email) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
