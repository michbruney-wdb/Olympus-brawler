export type AvatarFacing = -1 | 1;

export const AVATAR_FACING_YAW = 0.58;
export const AVATAR_HEAVY_YAW_BOOST = 0.34;

export function avatarFacingYaw(facing: AvatarFacing): number {
  return facing === 1 ? AVATAR_FACING_YAW : -AVATAR_FACING_YAW;
}

export function avatarAttackYaw(facing: AvatarFacing, animation: string): number {
  const baseYaw = avatarFacingYaw(facing);
  if (animation !== "heavy") return baseYaw;
  return baseYaw + facing * AVATAR_HEAVY_YAW_BOOST;
}
