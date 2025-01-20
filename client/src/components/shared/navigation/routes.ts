import { RouteProps, AdminRouteSection } from "./types";

export const routeListLanding: RouteProps[] = [
  {
    href: "#about",
    label: "About us",
  },
  {
    href: "#howItWorks",
    label: "How It Works",
  },
  {
    href: "#services",
    label: "Services",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const routeListSoldier: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/requestForm",
    label: "Request Form",
  },
  {
    href: "/my-requests",
    label: "My Requests",
  },
  {
    href: "/social",
    label: "Social",
  },
  {
    href: "/home/eatup",
    label: "EatUps",
  },
  {
    href: "/vouchers",
    label: "Vouchers@",
  },
  {
    href: "/rights",
    label: "Your Rights",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListMunicipality: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/requests",
    label: "Answer Requests @",
  },
  {
    href: "/social",
    label: "Social",
  },
  {
    href: "/new-post",
    label: "Create Event",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },
  {
    href: "/city-requests",
    label: "City Requests",
  },
  {
    href: "/create-city",
    label: "Create City",
  },
  {
    href: "/city-approval",
    label: "City Approval",
  },
  {
    href: "/join-city",
    label: "Join City",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListDonor: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/contribute",
    label: "Pay Requests",
  },
  {
    href: "/new-post",
    label: "Create EatUp",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },
  {
    href: "/my-donations",
    label: "My Donations",
  },
  {
    href: "/create-donation",
    label: "Create Donation",
  },

  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListOrganization: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/home/social",
    label: "Social",
  },
  {
    href: "/new-post",
    label: "Create Event",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListBusiness: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/discounts",
    label: "Add Discount @",
  },
  {
    href: "/verify-soldier",
    label: "Verify Soldier @",
  },
  {
    href: "/vouchers/create",
    label: "Create Vouchers @",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListAdmin: AdminRouteSection[] = [
  {
    section: "Admin Panel",
    routes: [
      {
        href: "/admin/queue",
        label: "Signup Queue",
      },
      {
        href: "/admin/users",
        label: "Manage Users @",
      },
      {
        href: "/admin/posts",
        label: "Manage Posts @",
      },
      {
        href: "/admin/cities",
        label: "Manage Cities",
      },
      {
        href: "/admin/vouchers",
        label: "Manage Vouchers @",
      },
    ],
  },
  {
    section: "Soldier Features",
    routes: routeListSoldier,
  },
  {
    section: "Municipality Features",
    routes: routeListMunicipality,
  },
  {
    section: "Donor Features",
    routes: routeListDonor,
  },
  {
    section: "Organization Features",
    routes: routeListOrganization,
  },
  {
    section: "Business Features",
    routes: routeListBusiness,
  },
  {
    section: "Common",
    routes: [
      {
        href: "/",
        label: "Home",
      },
      {
        href: "/profile",
        label: "Profile",
      },
      {
        href: "/logout",
        label: "Logout",
      },
    ],
  },
];
