/**
 * Safely extracts a human-readable message from an unknown caught value.
 * Use in every catch block instead of `err: any`.
 *
 * @example
 * catch (err) {
 *   setError(getErrorMessage(err));
 * }
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Something went wrong';
};
