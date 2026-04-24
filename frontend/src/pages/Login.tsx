import { useState, type ChangeEvent, type FormEvent } from "react";
import { postRequest } from "../api/requests";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

import { Eye, EyeOff, Heart, AlertCircle, Check, Loader2 } from "lucide-react";
import UnAuthHeader from "../components/UnAuthHeader";

import famBg from "../assets/fam.jpg";
import motherBabyLogo from "../assets/motherbaby.jpg";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const { setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string | boolean): string | null => {
    switch (name) {
      case "email":
        if (!value.toString().trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString()))
          return "Please enter a valid email address";
        return null;
      case "password":
        if (!value.toString().trim()) return "Password is required";
        if (value.toString().length < 6) return "Password must be at least 6 characters";
        return null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    (Object.keys(formData) as Array<keyof LoginFormData>).forEach((key) => {
      if (key !== "rememberMe") {
        const value = formData[key];
        const fieldError = validateField(key, value);
        if (fieldError) newErrors[key] = fieldError;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (error) setError(null);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldError = validateField(name, fieldValue);
    if (fieldError) setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true, password: true, rememberMe: true });

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRequest("/auth/login", formData);

      if (formData.rememberMe) localStorage.setItem("rememberMe", "true");

      setAccessToken(response.access_token);
      setUser(response.user);

      navigate("/");
    } catch (err: any) {
      if (err.response?.data?.detail) setError(err.response.data.detail);
      else setError("Network error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with WelcomeSection styling */}
      <div className="absolute inset-0">
        <img src={famBg} alt="Background" className="w-full h-full object-cover" />
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b]/5 via-transparent to-[#d88a8d]/5 animate-[gradient-x_8s_ease-in-out_infinite]"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#e5989b]/20 animate-[float_linear_infinite]"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Glow effect */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e5989b]/30 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Soft overlay to make UI readable */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <UnAuthHeader />
      </div>

      {/* Content */}
      <div className="relative z-20 pt-14 lg:pt-16 min-h-screen flex">
        {/* Left side (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-8">
          <div className="max-w-sm animate-[slide-up_0.6s_ease-out]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs">
              <Heart className="w-3.5 h-3.5" />
              Nurtura
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-tight">
              Care that feels <span className="text-pink-200">personal</span>.
            </h2>

            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Track progress, manage profiles, and stay supported through every step of the journey.
            </p>

            {/* Optional logo circle */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white/40 shadow-xl">
                <img src={motherBabyLogo} alt="Nurtura" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Motherhood Companion</p>
                <p className="text-white/70 text-xs">Secure • Simple • Reliable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="flex-1 flex items-center justify-center lg:justify-end px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-[340px] lg:mr-16 animate-[slide-up_0.6s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
            <div className="relative">
              <div className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.25)] rounded-[2rem] p-6 sm:p-7">
                {/* Icon badge */}
                <div className="flex items-center justify-center -mt-12 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e5989b] to-[#d88a8d] shadow-lg flex items-center justify-center border border-white/50">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="text-center mb-5">
                  <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
                  <p className="text-gray-600 text-xs mt-1">Sign in to continue</p>
                </div>

                {error && (
                  <div className="bg-[#dc143c]/10 border border-[#dc143c]/30 text-[#dc143c] px-3 py-2 rounded-xl mb-4 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-800">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="huma@gmail.com"
                      className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                        errors.email && touched.email
                          ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                          : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                      }`}
                    />
                    {errors.email && touched.email && (
                      <p className="text-[#dc143c] text-[10px] mt-0.5 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-gray-800">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="*********"
                        className={`w-full px-3 py-2.5 text-sm pr-10 border rounded-xl bg-white/80 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                          errors.password && touched.password
                            ? "border-[#dc143c] focus:ring-[#dc143c]/20"
                            : "border-gray-200 focus:ring-[#e5989b]/30 focus:border-[#e5989b] hover:border-[#e5989b]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="text-[#dc143c] text-[10px] mt-0.5 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember + forgot */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 border-2 rounded-md mr-2 flex items-center justify-center transition-all duration-200 ${
                          formData.rememberMe
                            ? "bg-[#e5989b] border-[#e5989b]"
                            : "border-gray-300 group-hover:border-[#e5989b] bg-white/80"
                        }`}
                      >
                        {formData.rememberMe && (
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 font-medium group-hover:text-gray-900">
                        Remember me
                      </span>
                    </label>

                    <a
                      href="/forgot-password"
                      className="text-xs text-[#e5989b] hover:text-[#d88a8d] font-semibold hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <p className="text-gray-700 text-xs">
                    New to Nurtura?{" "}
                    <a
                      href="/signup"
                      className="text-[#e5989b] hover:text-[#d88a8d] font-bold hover:underline"
                    >
                      Create an account
                    </a>
                  </p>
                </div>
              </div>

              <p className="text-center text-white/70 text-[10px] mt-3">
                By signing in you agree to our terms and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom keyframes */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;