export function canManageInventory(user) {
  return user?.role === 'admin' || user?.role === 'pengurus';
}
