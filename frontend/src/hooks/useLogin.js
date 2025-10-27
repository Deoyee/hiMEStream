import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import toast from "react-hot-toast";


const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: loginMutation, isPending, error } = useMutation({ // Changed to mutateAsync
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Invalidate "authUser" query
      toast.success("Logged in successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });
  return { loginMutation, isPending, error, queryClient }; // Export queryClient
};
export default useLogin