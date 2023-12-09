import { DeveloperStatus } from "@/types/DeveloperStatus.ts";

// Developer
interface DeveloperRequiredFields {
  emailConfirmed: boolean;
  id: string;
}

export interface Developer extends DeveloperRequiredFields {
  // YYYY-MM-DD
  availableToWorkStartDate: string | null;
  bio: string | null;
  location: string | null;
  countryCode: string | null;
  email: string | null;
  name: string | null;
  openToContract: boolean;
  openToFullTime: boolean;
  openToPartTime: boolean;
  status: DeveloperStatus | null;
}
