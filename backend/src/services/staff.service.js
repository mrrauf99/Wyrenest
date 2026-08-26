import { User } from "../models/user.model.js";

export const getStaffService = async (skipItems, limit) => {
  const [result] = await User.aggregate([
    {
      $match: { role: "staff" },
    },
    {
      $project: { name: 1, email: 1, isActive: 1, createdAt: 1 },
    },
    {
      $facet: {
        items: [
          {
            $skip: skipItems,
          },
          {
            $limit: limit,
          },
        ],

        totalDocs: [
          {
            $count: "count", // "count" is the field name which stores the result
          },
        ],
      },
    },
  ]);

  return {
    items: result.items,
    total: result.totalDocs[0]?.count ?? 0,
  };
};
