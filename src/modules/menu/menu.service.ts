import databaseService from "~/database/database.services";

class MenuService {
    async getMenu(language: string) {
        const result = await databaseService.mainCategories
            .aggregate([
                {
                    $match: {
                        status: true,
                        language: language,
                    },
                },
                {
                    $lookup: {
                        from: "subCategories",
                        localField: "_id",
                        foreignField: "idMain",
                        as: "subCategories",
                    },
                },
            ])
            .toArray();
        return result;
    }
}

const menuService = new MenuService();
export default menuService;

/**
 *
 *  */
