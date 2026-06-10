export type AvatarFacing = -1 | 1;

export const AVATAR_FACING_YAW = 0.58;

export function avatarFacingYaw(facing: AvatarFacing): number {
  return facing === 1 ? AVATAR_FACING_YAW : -AVATAR_FACING_YAW;
}
