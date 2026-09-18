import { requireUser } from "@/lib/session";
import { getActiveSubscription } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";

export default async function MembershipAccountPage() {
  const user = await requireUser();
  const sub = await getActiveSubscription(user.id);
  return (
    <div>
      <h1 className="font-display text-4xl">Membership</h1>
      {sub ? (
        <div className="mt-6 rounded-3xl bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-ajrak">{sub.status}</p>
          <p className="mt-2 font-display text-3xl">{sub.plan.name}</p>
          <p className="mt-2 text-sm text-ink/70">Expires {formatDate(sub.expiresAt)}</p>
        </div>
      ) : (
        <div className="mt-6">
          <p>You do not have an active membership.</p>
          <Button href="/membership" variant="primary" className="mt-4">
            View plans
          </Button>
        </div>
      )}
    </div>
  );
}
