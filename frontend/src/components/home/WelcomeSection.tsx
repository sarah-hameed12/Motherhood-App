interface WelcomeSectionProps {
  firstName?: string;
}

const WelcomeSection = ({ firstName }: WelcomeSectionProps) => (
  <div className="relative mb-6 sm:mb-8 text-center sm:text-left overflow-hidden">
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

    {/* Glow effect behind badge */}
    <div className="absolute left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 top-0 w-32 h-32 bg-[#e5989b]/30 rounded-full blur-3xl animate-pulse"></div>

    <div className="relative z-10">
      {/* Enhanced badge with glow and animation */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#e5989b]/30 shadow-lg mb-4 transform hover:scale-105 transition-all duration-300 animate-[fade-in_0.6s_ease-out]">
        <div className="relative">
          <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-ping absolute"></div>
          <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-pulse relative"></div>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-gray-700 ml-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] bg-clip-text text-transparent">
          Parenting Dashboard
        </span>
        <div className="ml-2 flex gap-0.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-[#e5989b] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main heading with enhanced gradient animation */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 animate-[slide-up_0.6s_ease-out]">
        <span className="text-gray-900">Welcome back, </span>
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] blur-xl opacity-50 animate-pulse"></span>
          <span className="relative bg-gradient-to-r from-[#e5989b] via-[#e5989b] to-[#d88a8d] bg-clip-text text-transparent bg-[length:300%_100%] animate-[gradient-shift_3s_ease_infinite]">
            {firstName}
          </span>
        </span>
        <span className="text-gray-900">!</span>
      </h1>

      {/* Enhanced description with gradient border */}
      <div className="relative max-w-2xl mx-auto sm:mx-0 animate-[slide-up_0.6s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b]/20 via-transparent to-[#d88a8d]/20 rounded-lg blur"></div>
        <p className="relative text-base sm:text-lg text-gray-700 leading-relaxed border-l-4 border-[#e5989b] pl-4 sm:pl-6">
          Here's your parenting dashboard for today. Track your children's growth and milestones in one place.
        </p>
      </div>

      {/* Decorative line */}
      <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#e5989b]/50 to-transparent w-full max-w-md mx-auto sm:mx-0 animate-[width-expand_0.8s_ease-out]"></div>
    </div>

    {/* Add custom keyframes to your global CSS or use a CSS-in-JS solution */}
    <style>{`
      @keyframes gradient-x {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes fade-in {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes width-expand {
        from { width: 0; opacity: 0; }
        to { width: 100%; opacity: 1; }
      }
      
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `}</style>
  </div>
);

export default WelcomeSection;