import { Suspense } from "react";
import UserRegistrationStep3Content from "@/components/auth/UserRegistrationStep3Content";

export default function UserRegistrationStep3Page() {
  return (
    <Suspense>
      <UserRegistrationStep3Content />
    </Suspense>
  );
}
