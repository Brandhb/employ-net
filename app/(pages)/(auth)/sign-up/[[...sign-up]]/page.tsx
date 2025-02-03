import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Join Employ-Net</h1>
          <p className="text-muted-foreground">
            Create your account to start your employment journey
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0",
                header: "hidden",
                footer: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}