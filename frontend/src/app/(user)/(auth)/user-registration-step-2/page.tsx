import { Suspense } from "react";
import UserRegistrationStep2Content from "@/components/user/auth/UserRegistrationStep2Content";

export default function UserRegistrationStep2Page() {
  return (
    <Suspense>
      <UserRegistrationStep2Content />
    </Suspense>
  );
}
