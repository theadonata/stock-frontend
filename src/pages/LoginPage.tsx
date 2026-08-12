import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AuthApi } from "../api/resources";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Card } from "../components/Card";
import { useToast } from "../components/ToastProvider";

// Username/password -> JWT, per spec's "Auth & access" section. On success
// the token is stored via AuthContext and the user is sent back to whatever
// protected route they originally tried to visit (or "/" by default).
export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Inline field errors are for validation problems the user can fix
  // themselves (empty fields); a failed login attempt against the server
  // (wrong password, network down) surfaces as a toast instead, since it's
  // not something client-side validation could have caught.
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const loginMutation = useMutation({
    mutationFn: AuthApi.login,
    onSuccess: (data) => {
      login(data.access_token);
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "Unable to log in. Please try again.";
      showToast(message, "error");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!username.trim()) errors.username = "Username is required.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    loginMutation.mutate({ username: username.trim(), password });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-1 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="relative inline-flex h-6 w-4 shrink-0 rounded-sm bg-brass before:absolute before:left-1/2 before:top-1.5 before:h-1 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-canvas"
          />
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Stock &amp; HPP</h1>
        </div>
        <p className="mb-6 text-sm text-stone">Sign in to continue.</p>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormField
            label="Username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <Button type="submit" fullWidth disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
