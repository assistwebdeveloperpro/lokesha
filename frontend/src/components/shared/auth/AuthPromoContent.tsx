"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  authPromoDescriptionClassName,
  authPromoTitleClassName,
} from "@/components/shared/auth/authTypography";
import loginPromoImg from "../../../../public/assets/images/auth/login-img.jpg";

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

const adminPromo = {
  title: "Manage Your Real Estate Platform Ease",
  description: "Manage property listings, monitor user activities, review submissions, and oversee your real estate platform to ensure a smooth experience for buyers and sellers."
};

function useAuthPromoCopy() {
  const pathname = usePathname();
  if (pathname === "/backend" || pathname.startsWith("/backend/")) return adminPromo;
  const isSignup = pathname === "/signup" || pathname.startsWith("/signup/");
  return isSignup ? signupPromo : loginPromo;
}

export default function AuthPromoContent() {
  const { title, description } = useAuthPromoCopy();

  return (
    <div className="mx-auto w-full max-w-xl text-left">
      <header>
        <h2 className={authPromoTitleClassName}>{title}</h2>
        <p className={authPromoDescriptionClassName}>{description}</p>
      </header>

      <div className="mt-8">
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
