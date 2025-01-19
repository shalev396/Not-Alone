import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  user: any;
  navigate: (path: string) => void;
}

export const AuthButtons = ({ user, navigate }: AuthButtonsProps) => {
  const getUserHomeRoute = () => {
    const userType = user.type?.toLowerCase();
    switch (userType) {
      case "admin":
        return "/admin/queue";
      case "soldier":
        return "/social";
      case "municipality":
        return "/social";
      case "donor":
        return "/requests/approved";
      case "organization":
        return "/social";
      case "business":
        return "/discounts";
      default:
        return "/login";
    }
  };

  if (user.email) {
    return (
      <Button className="w-full" onClick={() => navigate(getUserHomeRoute())}>
        {user.firstName || user.email}
      </Button>
    );
  }

  return (
    <>
      <Button className="w-full" onClick={() => navigate("/login")}>
        Login
      </Button>
      <Button className="w-full" onClick={() => navigate("/signup")}>
        SignUp
      </Button>
    </>
  );
};
