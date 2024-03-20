import paginationFunction from "./pagination.js";
export class ApiFeatures {
  constructor(query, mongooseQuery) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  pagination({ page, size }) {
    const { limit, skip } = paginationFunction({ page, size });

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  sort(sortBy) {
    if (!sortBy) {
      this.mongooseQuery = this.mongooseQuery.sort({ created: -1 });
      return this;
    }
    const formula = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":");
    const [key, value] = formula.split(":");

    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value });
    return this;
  }

  search(search) {
    const queryFilter = {};

    // if (search.title) queryFilter.title = { $regex: search.title, $options: "i" };

    if (search.couponCode) {
      const searchWords = search.couponCode.split(" ");
      const regexExpression = searchWords
        .map((word) => `(?=.*${word})`)
        .join("");
      queryFilter.couponCode = { $regex: regexExpression, $options: "i" };
    }

    if (search.name) {
      const searchWords = search.name.split(" ");
      const regexExpression = searchWords
        .map((word) => `(?=.*${word})`)
        .join("");
      queryFilter.name = { $regex: regexExpression, $options: "i" };
    }


    if (search.title) {
      const searchWords = search.title.split(" ");
      const regexExpression = searchWords
        .map((word) => `(?=.*${word})`)
        .join("");
      queryFilter.title = { $regex: regexExpression, $options: "i" };
    }


    if (search.discount) queryFilter.discount = { $ne: 0 };
    if (search.priceFrom && !search.priceTo)
      queryFilter.appliedPrice = { $gte: search.priceFrom };
    if (search.priceTo && !search.priceFrom)
      queryFilter.appliedPrice = { $lte: search.priceTo };
    if (search.priceTo && search.priceFrom)
      queryFilter.appliedPrice = {
        $gte: search.priceFrom,
        $lte: search.priceTo,
      };

    this.mongooseQuery = this.mongooseQuery.find(queryFilter);
    return this;
  }
}

export default ApiFeatures;
