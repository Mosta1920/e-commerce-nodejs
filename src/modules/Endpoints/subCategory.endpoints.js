import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_SUBCATEGORY: [systemRoles.SUPER_ADMIN],
  UPDATE_SUBCATEGORY: [systemRoles.SUPER_ADMIN],
  DELETE_SUBCATEGORY: [systemRoles.SUPER_ADMIN],
};
