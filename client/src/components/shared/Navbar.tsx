import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "@/Redux/store";

import { NavbarProps } from "./navigation/types";
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
import { RouteProps } from "./navigation/types";
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
    switch (userType) {
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
        return routeListLanding;
    }
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
