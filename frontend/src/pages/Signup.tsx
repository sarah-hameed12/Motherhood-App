import { useState, type ChangeEvent, type FormEvent } from "react";
import { postRequest } from "../api/requests";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

import famBg from "../assets/fam.jpg";
import Logo from "../assets/motherbaby.jpg";

import { type SignupFormData, type SignupErrors } from "../interfaces/AuthInterfaces";
import { Eye, EyeOff, Heart, AlertCircle, Check } from "lucide-react";
import UnAuthHeader from "../components/UnAuthHeader";

const Signup = () => {
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    return null;
  };

  const validateField = (name: keyof SignupFormData, value: string | boolean): string | null => {
    switch (name) {
      case "firstname":
        if (!value.toString().trim()) return "First name is required";
        if (value.toString().length < 2) return "First name must be at least 2 characters";
        return null;

      case "lastname":
        if (!value.toString().trim()) return "Last name is required";
        if (value.toString().length < 2) return "Last name must be at least 2 characters";
        return null;

      case "username":
        if (!value.toString().trim()) return "Username is required";
        if (value.toString().length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value.toString()))
          return "Username can only contain letters, numbers, and underscores";
        return null;

      case "email":
        if (!value.toString().trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString()))
          return "Please enter a valid email address";
        return null;

      case "password":
        return validatePassword(value.toString());

      case "confirmPassword":
        if (value !== formData.password) return "Passwords don't match";
        return null;

      case "agreeToTerms":
        if (!value) return "You must agree to the terms and conditions";
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignupErrors = {};
    (Object.keys(formData) as Array<keyof SignupFormData>).forEach((key) => {
      const val = formData[key];
      const err = validateField(key, val as string | boolean);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name as keyof SignupFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === "checkbox" ? checked : value,
    }));

    if (error) setError(null);

    if (touched[fieldName]) {
      const fieldValue = type === "checkbox" ? checked : value;
      const fieldError = validateField(fieldName, fieldValue);
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
      } else {
        setErrors((prev) => {
          const n = { ...prev };
          delete n[fieldName];
          return n;
        });
      }
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name as keyof SignupFormData;
    const fieldValue = type === "checkbox" ? checked : value;

    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const fieldError = validateField(fieldName, fieldValue);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
    } else {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldName];
        return n;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched = (Object.keys(formData) as Array<keyof SignupFormData>).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as { [key: string]: boolean }
    );
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { confirmPassword, agreeToTerms, ...submitData } = formData;

      const response = await postRequest("/auth/signup", submitData);

      setIsSuccess(true);

      // IMPORTANT: adjust this based on your backend response shape
      // If backend returns { access_token, user } (like login), use:
      if (response?.access_token) {
        setAccessToken(response.access_token);
        if (response.user) setUser(response.user);
      } else {
        // fallback if your postRequest returns token directly
        setAccessToken(response);
      }

      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      if (err.response?.data?.detail) setError(err.response.data.detail);
      else setError("Network error!");
    } finally {
      setLoading(false);
    }
  };

  const getError = (fieldName: keyof SignupFormData): string | undefined => errors[fieldName];
  const isTouched = (fieldName: keyof SignupFormData): boolean => touched[fieldName] || false;

  // Success Screen (same style + background)
  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={famBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/55 via-pink-700/35 to-black/55" />
          <div className="absolute -top-28 -left-28 w-[28rem] h-[28rem] bg-pink-300/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-28 -right-28 w-[30rem] h-[30rem] bg-rose-200/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-30">
          <UnAuthHeader />
        </div>

        <div className="relative z-20 pt-16 lg:pt-20 min-h-screen flex items-center justify-center px-4">
          <div className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.25)] rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/50">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nurtura!</h2>
            <p className="text-gray-700 text-sm mb-6">
              Your account has been created successfully. Redirecting you...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#e5989b] to-[#d88a8d] h-full rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Page
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={famBg} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/55 via-pink-700/35 to-black/55" />
        <div className="absolute -top-28 -left-28 w-[28rem] h-[28rem] bg-pink-300/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -right-28 w-[30rem] h-[30rem] bg-rose-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <UnAuthHeader />
      </div>

      {/* Content */}
      <div className="relative z-20 pt-16 lg:pt-20 min-h-screen flex">
        {/* Left side (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-10">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs">
              <Heart className="w-4 h-4" />
              Nurtura
            </div>

            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white leading-tight">
              Start your <span className="text-pink-200">journey</span> with support.
            </h2>

            <p className="mt-4 text-white/80 text-base leading-relaxed">
              Create an account to manage profiles, track milestones, and stay connected.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shadow-xl">
                <img src={Logo} alt="Nurtura" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold">Motherhood Companion</p>
                <p className="text-white/70 text-sm">Secure • Simple • Reliable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="flex-1 flex items-center justify-center lg:justify-end px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-md lg:mr-16">
            <div className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.25)] rounded-2xl p-6 sm:p-8">
              {/* Icon badge */}
              <div className="flex items-center justify-center -mt-14 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e5989b] to-[#d88a8d] shadow-lg flex items-center justify-center border border-white/50">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                <p className="text-gray-600 text-sm mt-1">Join our community of supportive parents</p>
              </div>

              {error && (
                <div className="bg-[#dc143c]/10 border border-[#dc143c]/30 text-[#dc143c] px-3 py-2 rounded-xl mb-4 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  {/* First */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">First name</label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John"
                      className={`w-full px-4 py-3 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                        getError("firstname") && isTouched("firstname")
                          ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                          : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                      }`}
                    />
                    {getError("firstname") && isTouched("firstname") && (
                      <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getError("firstname")}
                      </p>
                    )}
                  </div>

                  {/* Last */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">Last name</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Doe"
                      className={`w-full px-4 py-3 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                        getError("lastname") && isTouched("lastname")
                          ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                          : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                      }`}
                    />
                    {getError("lastname") && isTouched("lastname") && (
                      <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getError("lastname")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="jane_123"
                    className={`w-full px-4 py-3 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                      getError("username") && isTouched("username")
                        ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                        : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                    }`}
                  />
                  {getError("username") && isTouched("username") && (
                    <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getError("username")}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@email.com"
                    className={`w-full px-4 py-3 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                      getError("email") && isTouched("email")
                        ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                        : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                    }`}
                  />
                  {getError("email") && isTouched("email") && (
                    <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getError("email")}
                    </p>
                  )}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 text-sm pr-12 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                          getError("password") && isTouched("password")
                            ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                            : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {getError("password") && isTouched("password") && (
                      <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {getError("password")}
                      </p>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">Confirm</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 text-sm pr-12 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                          getError("confirmPassword") && isTouched("confirmPassword")
                            ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                            : formData.confirmPassword && formData.confirmPassword === formData.password
                            ? "border-green-300 focus:ring-green-200"
                            : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className="text-green-700 text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="mt-1 w-4 h-4 accent-[#e5989b]"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="#" className="text-[#e5989b] hover:text-[#d88a8d] font-semibold hover:underline">
                        Terms
                      </a>{" "}
                      &{" "}
                      <a href="#" className="text-[#e5989b] hover:text-[#d88a8d] font-semibold hover:underline">
                        Privacy
                      </a>
                    </span>
                  </label>

                  {getError("agreeToTerms") && isTouched("agreeToTerms") && (
                    <p className="text-[#dc143c] text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getError("agreeToTerms")}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Create account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-700 text-sm">
                  Already have an account?{" "}
                  <a href="/login" className="text-[#e5989b] hover:text-[#d88a8d] font-bold hover:underline">
                    Sign in
                  </a>
                </p>
              </div>
            </div>

            <p className="text-center text-white/70 text-xs mt-4">
              By signing up you agree to our terms and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;