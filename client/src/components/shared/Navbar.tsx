import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "@/Redux/store";
import { NavbarProps, RouteProps, AdminRouteSection } from "./navigation/types";
import { setChannels } from "@/Redux/channelSlice";
import {
  routeListLanding,
  routeListSoldier,
  routeListMunicipality,
  routeListDonor,
  routeListOrganization,
  routeListBusiness,
  routeListAdmin,
} from "./navigation/routes";
import { LandingNav } from "./navigation/variants/LandingNav";
import { HomeNav } from "./navigation/variants/HomeNav";
import { AdminNav } from "./navigation/variants/AdminNav";
import { api } from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchChannels = async () => {
  const response = await api.get("/channels");
  return response.data;
};

export const Navbar = ({
  isVertical = false,
  isAccordion = false,
  modes,
}: NavbarProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [accordionOpen, setAccordionOpen] = useState<boolean>(false);
  const [channelsLinks, setChannelsLinks] = useState<RouteProps[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user's city using React Query only for Municipality and Admin users
  const { data: userCity = [] } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch user city:", error);
        return [];
      }
    },
    enabled:
      !!user.email && (user.type === "Municipality" || user.type === "Admin"),
  });

  const { data: channelsData, refetch } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannels,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 1,
    retry: 3,
    enabled: !!user.email,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Function to filter routes based on city membership
  const filterRoutesByAccess = (
    routes: (RouteProps | AdminRouteSection)[]
  ): (RouteProps | AdminRouteSection)[] => {
  
    // If user is not Municipality or Admin, filter out routes that require city access
    if (user.type !== "Municipality" && user.type !== "Admin") {
      return routes
      .map((route) => {
          if ("hideInNavbar" in route && route.hideInNavbar) return null; // Excluir rotas com hideInNavbar
          if ("routes" in route && route.routes) {
            const filteredRoutes = route.routes.filter(
              (r) => !r.requiresCityOrAdmin
            );
            return filteredRoutes.length > 0
              ? { ...route, routes: filteredRoutes }
              : null;
          }
          return !route.requiresCityOrAdmin ? route : null;
        })
        .filter(
          (route): route is RouteProps | AdminRouteSection => route !== null
        );
    }

    // For Municipality and Admin users, check city membership
    return routes
      .map((route) => {
        if ("routes" in route && route.routes) {
          const filteredRoutes = route.routes.filter(
            (r) =>
              !r.requiresCityOrAdmin ||
              user.type === "Admin" ||
              (Array.isArray(userCity) && userCity.length > 0)
          );
          return filteredRoutes.length > 0
            ? { ...route, routes: filteredRoutes }
            : null;
        }
        if (
          route.requiresCityOrAdmin &&
          user.type !== "Admin" &&
          (!Array.isArray(userCity) || userCity.length === 0)
        ) {
          return null;
        }
        return route;
      })
      .filter(
        (route): route is RouteProps | AdminRouteSection => route !== null
      );
  };

  const handleAccordionToggle = async (newState: boolean) => {
    if (newState && modes !== "landing") {
      console.log("Navbar menu opened");
      const state = queryClient.getQueryState(["channels"]);
      const isStale = state?.dataUpdatedAt
        ? Date.now() - state.dataUpdatedAt > 1000 * 60 * 1
        : true;

      if (isStale) {
        console.log("Data is stale, refetching channels");
        await refetch();
      } else {
        console.log("Data is still fresh, using cached channels");
      }
    }
    setAccordionOpen(newState);
  };

  useEffect(() => {
    if (channelsData?.data) {
      dispatch(setChannels(channelsData.data));
      const links = channelsData.data.map((channel: any) => ({
        href: `/channel/${channel._id}`,
        label: channel.name,
      }));
      setChannelsLinks(links);
    } else if (channelsData) {
      dispatch(setChannels(channelsData));
      const links = channelsData.map((channel: any) => ({
        href: `/channel/${channel._id}`,
        label: channel.name,
      }));
      setChannelsLinks(links);
    } else {
      setChannelsLinks([]);
    }
    console.log("Channels data updated:", channelsData);
  }, [channelsData, dispatch]);

  const getRouteList = () => {
    const userType = user.type?.toLowerCase();
    let routes: (RouteProps | AdminRouteSection)[];
    switch (userType) {
      case "admin":
        routes = routeListAdmin;
        break;
      case "soldier":
        routes = 
          routeListSoldier
        ;
        break;
      case "municipality":
        routes = routeListMunicipality;
        break;
      case "donor":
        routes = routeListDonor;
        break;
      case "organization":
        routes = routeListOrganization;
        break;
      case "business":
        routes = routeListBusiness;
        break;
      default:
        routes = routeListLanding;
    }
    return filterRoutesByAccess(routes);
  };

  if (modes === "landing") {
    return (
      <LandingNav
        routeList={routeListLanding}
        user={user}
        navigate={navigate}
      />
    );
  }

  const routeList = getRouteList();
  const navProps = {
    routeList,
    channelsLinks: channelsLinks || [],
    navigate,
    accordionOpen,
    setAccordionOpen: handleAccordionToggle,
    isAccordion,
    isVertical,
  };

  if (user.type === "Admin") {
    return <AdminNav {...navProps} />;
  }

  return <HomeNav {...navProps} routeList={routeList as RouteProps[]} />;
};
