"use server";

// Explicit action boundary for the client-side upload control.
import {
  discardVenueMapMarkerUploadAction as discard,
  finalizeVenueMapMarkerUploadAction as finalize,
  prepareVenueMapMarkerUploadAction as prepare,
} from "./venues-admin-service";

export async function prepareVenueMapMarkerUploadAction(venueId: string, mimeType: string) {
  return prepare(venueId, mimeType);
}

export async function finalizeVenueMapMarkerUploadAction(venueId: string, path: string) {
  return finalize(venueId, path);
}

export async function discardVenueMapMarkerUploadAction(venueId: string, path: string) {
  return discard(venueId, path);
}
