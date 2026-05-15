import LoginForm from "@/components/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--tache-cream)] py-12 px-4 sm:px-6 lg:px-8">
            <LoginForm />
        </div>
    );
}
