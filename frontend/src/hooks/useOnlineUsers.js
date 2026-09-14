import { useEffect, useState, useCallback, useMemo } from "react";
import useAuthUser from "./useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { streamClient, connectUser } from "../lib/stream";

export const useOnlineUsers = () => {
  const { authUser } = useAuthUser();
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    let isMounted = true;

    const setupPresence = async () => {
      try {
        await connectUser(authUser, tokenData.token);

        if (!isMounted) return;

        // Query users with presence enabled to get initial online list
        const response = await streamClient.queryUsers(
          { id: { $ne: authUser._id } },
          { last_active: -1 },
          { presence: true, limit: 100 }
        );

        if (isMounted && response?.users) {
          const activeIds = new Set();
          response.users.forEach((u) => {
            if (u.online) {
              activeIds.add(u.id);
            }
          });
          setOnlineUserIds(activeIds);
        }
      } catch (err) {
        console.error("Failed to setup Stream presence:", err);
      }
    };

    setupPresence();

    const handlePresenceChange = (event) => {
      if (!event.user?.id) return;
      const targetId = event.user.id;
      const isOnline = Boolean(event.user.online);

      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
        return next;
      });
    };

    streamClient.on("user.presence.changed", handlePresenceChange);
    streamClient.on("user.updated", handlePresenceChange);

    return () => {
      isMounted = false;
      streamClient.off("user.presence.changed", handlePresenceChange);
      streamClient.off("user.updated", handlePresenceChange);
    };
  }, [authUser, tokenData?.token]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      const normalizedId = typeof userId === "object" ? userId._id || userId.id : userId;
      if (!normalizedId) return false;

      // Current authenticated user is active
      if (authUser && String(normalizedId) === String(authUser._id)) {
        return true;
      }

      return onlineUserIds.has(String(normalizedId));
    },
    [authUser, onlineUserIds]
  );

  return {
    onlineUserIds,
    isUserOnline,
  };
};

export default useOnlineUsers;
