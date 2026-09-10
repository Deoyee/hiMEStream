import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import Avatar from "../components/Avatar.jsx";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm opacity-70 mt-1">Manage your connection requests and activity</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Incoming friend requests */}
          {incomingRequests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserCheckIcon className="h-5 w-5 text-primary" />
                <span>Friend Requests</span>
                <span className="badge badge-primary badge-sm ml-2">
                  {incomingRequests.length}
                </span>
              </h2>

              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="card bg-base-200/80 hover:bg-base-200 border border-base-content/10 shadow-sm rounded-2xl"
                  >
                    <div className="card-body p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Avatar
                            src={request.sender.profilePic}
                            name={request.sender.fullName}
                            size="md"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-base-content truncate">{request.sender.fullName}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Native: {request.sender.nativeLanguage}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                Learning: {request.sender.learningLanguage}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-sm rounded-xl font-medium px-4 shadow-sm active:scale-[0.98]"
                          onClick={() => acceptRequestMutation(request._id)}
                          disabled={isPending}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Accepted requests / New Connections */}
          {acceptedRequests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-success" />
                <span>New Connections</span>
              </h2>

              <div className="space-y-3">
                {acceptedRequests.map((notification) => (
                  <div key={notification._id} className="card bg-base-200/80 border border-base-content/10 shadow-sm rounded-2xl">
                    <div className="card-body p-4 sm:p-5">
                      <div className="flex items-start gap-3.5">
                        <Avatar
                          src={notification.recipient.profilePic}
                          name={notification.recipient.fullName}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-base-content">{notification.recipient.fullName}</h3>
                          <p className="text-xs opacity-75 my-0.5">
                            {notification.recipient.fullName} accepted your friend request
                          </p>
                          <p className="text-[11px] flex items-center opacity-60">
                            <ClockIcon className="size-3 mr-1" />
                            Recently
                          </p>
                        </div>
                        <div className="badge badge-success badge-sm font-medium gap-1">
                          <MessageSquareIcon className="size-3" />
                          New Friend
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
            <NoNotificationsFound />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;