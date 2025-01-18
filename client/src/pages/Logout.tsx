import store from "@/Redux/store";
import { resetUser } from "@/Redux/userSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Logout() {
  const navigate = useNavigate();
  sessionStorage.clear();
  useEffect(() => {
    sessionStorage.clear();
    store.dispatch(resetUser());
    navigate("/");
  }, []);
  return <div></div>;
}
