export function isUniqueConstraintError(error, field) {
  return error?.code === "P2002" && (!field || error.meta?.target?.includes(field));
}
