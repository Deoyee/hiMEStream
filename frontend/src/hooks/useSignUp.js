import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';

const useSignUp = () => {
    const queryClient = useQueryClient();

    const { mutate: signupMutation, isPending, error } = useMutation({
        mutationFn: signup,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] }),
    });
    return { signupMutation, isPending, error };
}

export default useSignUp