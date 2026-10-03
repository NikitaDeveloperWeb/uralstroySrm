import { NavMenu } from '@/shared/components/navigation/NavMenu';
import { getAuthUser } from '@/shared/lib/auth';

const MANAGER_ROLES = ['MANAGER'] as const;

export async function NavMenuWrapper() {
  const user = await getAuthUser();

  return <NavMenu userRole={user?.role} />;
}
