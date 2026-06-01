/** Default route after login, by role */
export function getHomeRoute(role, isVerified = true) {
  if (role === 'admin') return '/admin';
  if (role === 'pharmacy') return isVerified ? '/pharmacy/inventory' : '/account-verification';
  return '/dashboard';
}
