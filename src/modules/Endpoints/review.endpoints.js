import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_REVIEW: [systemRoles.USER],
  UPDATE_REVIEW: [systemRoles.USER],
};
