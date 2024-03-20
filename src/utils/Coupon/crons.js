import { scheduleJob } from "node-schedule";
import Coupon from "../../../DB/Models/coupon.model.js";

import { DateTime} from 'luxon'

export function changeExpiredCoupons() {
  scheduleJob("40 * * * * *", async () => {
    console.log("Expired Coupons have been changed");
    for (const coupon of await Coupon.find({})) {
      if (DateTime.fromISO(coupon.toDate) < DataTime.now()) {
        coupon.couponStatus = "expired";
      }
      await coupon.save();
    }
  });
}
