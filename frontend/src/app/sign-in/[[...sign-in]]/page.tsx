// src/app/sign-in/[[...sign-in]]/page.tsx
// Clerk v6 handles the sign-in UI automatically — no custom code needed here.

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <SignIn />
    </div>
  );
}
