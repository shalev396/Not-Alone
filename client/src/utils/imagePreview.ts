/**
 * Preview URL for a user-selected file, used as an <img> src.
 * Only image files get a preview; the object URL is URI-encoded so the
 * file-derived value is never written into the attribute unescaped.
 */
export const getImagePreviewUrl = (file: File): string | null => {
  if (!file.type.startsWith("image/")) return null;
  return encodeURI(URL.createObjectURL(file));
};
