export function canAccess(
  ownerId: string,
  userId: string,
  sharedUserIds: string[]
): boolean {
  return ownerId === userId || sharedUserIds.includes(userId);
}