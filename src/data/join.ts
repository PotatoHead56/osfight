// Rules for the sign-up form, shared by the browser form and the server action.
export const LIMITS = { name: 10, title: 10, move: 12, bio: 60 };

// Photos are shrunk in the browser to this size before uploading.
export const PHOTO_MAX_EDGE = 1024;
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export type JoinValues = {
  name: string;
  title: string;
  move: string;
  bio: string;
};

export type JoinState = {
  status: "idle" | "success" | "error";
  message: string;
  // Echoed back after a failed attempt so the visitor does not retype everything.
  values?: JoinValues;
};
