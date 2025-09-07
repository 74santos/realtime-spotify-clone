import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

const updateApiToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, getToken, userId } = useAuth(); // ✅ use isLoaded
  const [loading, setLoading] = useState(true);

  // const checkAdminStatus = useAuthStore((state) => state.checkAdminStatus);
  const { checkAdminStatus } = useAuthStore();
  const {initSocket, disconnectSocket } = useChatStore()
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log("Auth effect triggered");
    if (!isLoaded || hasChecked ) return; // wait until Clerk is ready

    const initAuth = async () => {
      try {
        const token = await getToken();
        // console.log("Got token:", token ? "✅ yes" : "❌ no");
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          // init socket
          if(userId) {
            initSocket(userId)
          }
        }
      } catch (error: any) {
        updateApiToken(null);
        console.log("Error in auth provider", error);
      } finally {
        setHasChecked(true); // ✅ prevents repeat calls
        setLoading(false);
      }
    };

    initAuth();

    return () => disconnectSocket();
  }, [isLoaded, getToken, hasChecked, checkAdminStatus, initSocket, userId, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
