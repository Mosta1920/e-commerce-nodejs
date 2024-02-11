import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_PRODUCT: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
  UPDATE_PRODUCT: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
  DELETE_PRODUCT: [systemRoles.SUPER_ADMIN , systemRoles.ADMIN],
};
