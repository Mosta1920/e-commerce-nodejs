import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_COUPON: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
  UPDATE_COUPON: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
  DELETE_COUPON: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
};
