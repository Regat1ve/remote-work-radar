import { signIn } from "@/auth";

export const metadata = {
  title: "Sign in — remote-work-radar",
};

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto space-y-6 py-12">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="text-ink-500 text-sm leading-relaxed">
        Sign in with GitHub to star jobs and keep a personal shortlist across devices.
        Everything else on the site works without an account.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/me" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-md bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 py-3 font-semibold hover:opacity-90"
        >
          Continue with GitHub
        </button>
      </form>
      <p className="text-xs text-ink-400">
        We store your GitHub name, email, and avatar. Nothing else. Signing out removes the session.
      </p>
    </div>
  );
}
