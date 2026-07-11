import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccountInfo } from "@/features/account/services/account-service";
import { AccountForm } from "@/features/account/components/account-form";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const info = await getAccountInfo(user.id);

  return (
    <div className="max-w-2xl">
      <AccountForm initialInfo={info} />
    </div>
  );
}
