import { useMutation } from "@tanstack/react-query";
import { registerUser, loginUser } from "@/lib/api/auth";
import { RegisterRequest, LoginRequest } from "@/lib/schemas";

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => registerUser(request),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => loginUser(request),
  });
}
