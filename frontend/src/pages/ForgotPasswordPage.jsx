import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, EyeIcon, EyeOffIcon, KeyRound, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "../lib/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send verification code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success(res.message || "Password reset successfully!");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      toast.success("A new verification code has been sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend verification code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        
        {/* Form Container */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-6 flex items-center justify-start gap-2">
              <img src="/logo.png" alt="hiMEStream logo" className="w-9 h-9 object-contain" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                hiMEStream
              </span>
            </div>

            {/* Error banner */}
            {error && (
              <div className="alert alert-error mb-6 py-2 px-4 text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Forgot Password?</h2>
                  <p className="text-sm opacity-70 mt-1">
                    No worries! Enter your registered email address below and we'll help you reset your password.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="form-control w-full space-y-2">
                    <label className="label p-0">
                      <span className="label-text font-medium">Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        className="input input-bordered w-full pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                      <Mail className="size-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Sending Code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Enter OTP & New Password */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full mb-2">
                    <CheckCircle2 className="size-3.5" />
                    Code sent to {email}
                  </div>
                  <h2 className="text-2xl font-bold">Reset Password</h2>
                  <p className="text-sm opacity-70 mt-1">
                    Please check your email inbox (and spam folder) for the 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* OTP Code */}
                  <div className="form-control w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="label p-0">
                        <span className="label-text font-medium">Verification Code</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" />
                        Resend Code
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="input input-bordered w-full pl-10 font-mono tracking-widest text-center sm:text-left"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                        autoFocus
                      />
                      <KeyRound className="size-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="form-control w-full space-y-1">
                    <label className="label p-0">
                      <span className="label-text font-medium">New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input input-bordered w-full pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/60 hover:text-base-content transition-colors focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-5" />
                        ) : (
                          <EyeIcon className="size-5" />
                        )}
                      </button>
                    </div>
                    <span className="text-xs opacity-60">At least 6 characters</span>
                  </div>

                  {/* Confirm New Password */}
                  <div className="form-control w-full space-y-1">
                    <label className="label p-0">
                      <span className="label-text font-medium">Confirm New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input input-bordered w-full pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/60 hover:text-base-content transition-colors focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="size-5" />
                        ) : (
                          <EyeIcon className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-base-content/70 hover:text-base-content underline"
                    >
                      Use a different email address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Back to sign in link */}
          <div className="text-center pt-8 border-t border-base-200 mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Right side illustration and message */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/signUp.png"
                alt="Password security illustration"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h3 className="text-xl font-semibold">Account Recovery Made Easy</h3>
              <p className="text-sm opacity-70">
                Keep your hiMEStream account secure while easily regaining access whenever you need it.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
