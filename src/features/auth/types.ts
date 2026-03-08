export type ProfileRole = "customer" | "merchant";

export type MembershipRole = "owner" | "manager" | "editor";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: ProfileRole;
};

export type OwnedVenue = {
  id: string;
  name: string;
  slug: string;
  membershipRole: MembershipRole;
};
