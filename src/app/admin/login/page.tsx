import { redirect } from "next/navigation";
import { isSupabaseConfigured, createServerSupabaseClient } from "@/lib/supabase";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <SetupNotice context="admin sign-in" />
      </div>
    );
  }

  // Already signed in? Skip straight to the dashboard.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16 text-cream">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-6 text-center text-xs text-sand/70">
          Need access? Ask a super_admin to invite you.
        </p>
      </div>
    </div>
  );
}
