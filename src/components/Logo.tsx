import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  type?: "light" | "dark" | "monochrome";
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md", type = "dark" }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const bgColors = {
    dark: "bg-zinc-950",
    light: "bg-white border border-zinc-100",
    monochrome: "bg-zinc-100",
  };

  const textColors = {
    dark: "text-white",
    light: "text-zinc-950",
    monochrome: "text-zinc-950",
  };

  return (
    <div className={`relative group inline-flex items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizes[size]} ${bgColors[type]} rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-2xl`}
      >
        {/* Unique Geometric Pattern Layer */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(255,255,255,1)_0%,transparent_50%)]"></div>
        </div>

        {/* The "IX" Mark with unique styling */}
        <div className="relative z-10 flex items-baseline gap-[1px]">
          <span className={`${textColors[type]} font-black italic tracking-tighter leading-none ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
            I
          </span>
          <span className={`${textColors[type]} opacity-50 font-black italic tracking-tighter leading-none ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
            X
          </span>
        </div>

        {/* Abstract Corner Element */}
        <div className={`absolute bottom-0 right-0 w-[40%] h-[40%] bg-white/10 skew-x-[-20deg] translate-x-1/2 translate-y-1/2`}></div>
      </motion.div>
      
      {size !== "sm" && (
        <div className="flex flex-col items-start leading-none gap-1">
           <span className={`font-bold uppercase tracking-[0.2em] font-inter ${size === 'xl' ? 'text-2xl' : 'text-sm'} ${type === 'light' ? 'text-zinc-950' : 'text-white'}`}>
             Invoxa
           </span>
           <span className={`text-[8px] font-medium text-zinc-500 uppercase tracking-[0.4em] italic`}>
             Quantified
           </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
