import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_CART: [systemRoles.USER],
  UPDATE_CART: [systemRoles.USER],
  DELETE_CART: [systemRoles.USER],
};
