"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import loginPromoImg from "../../../public/assets/images/auth/login-img.jpg";

const loginPromo = {
  title: "We are Offering The Best Real Estate Property For All",
  description:
    "Post your property for FREE and connect with 1 Lakh+ buyers instantly. Get real-time alerts, detailed listings, and quick responses via Phone, Email & SMS.",
};

const signupPromo = {
  title: "One Platform. Every Property Solution.",
  description:
    "Post your property for free and connect with serious buyers instantly. Track inquiries, showcase listings, and get alerts in real-time.",
};

function useAuthPromoCopy() {
  const pathname = usePathname();
  const isSignup = pathname === "/signup" || pathname.startsWith("/signup/");
  return isSignup ? signupPromo : loginPromo;
}

export default function AuthPromoContent() {
  const { title, description } = useAuthPromoCopy();

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-xl">
      <h2 className="font-display text-[1.375rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.625rem] xl:text-[1.875rem]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:mt-2.5 md:mt-3 xl:mt-4 xl:text-[0.9375rem]">
        {description}
      </p>

      <div className="mt-8 hidden lg:block">
        <Image
          src={loginPromoImg}
          alt="Happy buyers and property listings"
          className="h-auto w-full max-w-none object-contain drop-shadow-sm"
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 44vw, 100vw"
          priority
        />
      </div>
    </div>
  );
}
