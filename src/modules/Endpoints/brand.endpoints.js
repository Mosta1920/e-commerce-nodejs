import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_BRAND: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
  UPDATE_BRAND: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
  DELETE_BRAND: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
};
