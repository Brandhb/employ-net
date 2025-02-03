// /pages/404.tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignedIn>
        <p>You are signed in, but the page was not found.</p>
      </SignedIn>
      <SignedOut>
        <p>The page you are looking for does not exist.</p>
      </SignedOut>
    </div>
  );
}
