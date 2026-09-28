"use server";

import { cookies } from "next/headers";
import {
  FILTER_COOKIE_NAME,
  parseFilterCookie,
  COOKIE_MAX_AGE,
  DEFAULT_FILTER,
  type FilterPreference,
} from "@/lib/cookies";

/**
 * Server Action: Menyimpan preferensi filter ke HTTP response cookie
 * Mengimplementasikan FR-13, BR-06, dan UC-04
 */
export async function setFilterPreferenceAction(
  filter: FilterPreference
): Promise<FilterPreference> {
  const cookieStore = await cookies();
  const validFilter = parseFilterCookie(filter);

  cookieStore.set(FILTER_COOKIE_NAME, validFilter, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // Boleh diakses oleh client script (FR-13, BR-06)
  });

  return validFilter;
}

/**
 * Helper Server-Side: Membaca nilai filter preferensi dari cookie request
 * Mengimplementasikan FR-14, BR-06, dan UC-04
 */
export async function getServerFilterPreference(): Promise<FilterPreference> {
  try {
    const cookieStore = await cookies();
    const rawValue = cookieStore.get(FILTER_COOKIE_NAME)?.value;
    return parseFilterCookie(rawValue);
  } catch {
    return DEFAULT_FILTER;
  }
}
