import databaseService from '~/database/database.services'
import { MainCategory, SubCategory, TagType } from './menu.schema'
import { ObjectId } from 'mongodb'
import { MENU_LANGUAGES } from './menu.enum'

class MenuService {
    async getMenu() {
        // for (let i = 0; i < subCategoryDataEN.length; i++) {
        //     await databaseService.subCategories.insertOne(
        //         new SubCategory({
        //             _id: new ObjectId(),
        //             indexSub: subCategoryDataEN[i].indexSub,
        //             nameSub: subCategoryDataEN[i].nameSub,
        //             idMain: new ObjectId(subCategoryDataEN[i].mainCategory),
        //             tags: subCategoryDataEN[i].tags as TagType[],
        //             statusSub: subCategoryDataEN[i].statusSub
        //         })
        //     )
        // }
        const data = await databaseService.subCategories.updateOne(
            {
                _id: new ObjectId('6656feb7c88eaa083cd1a039')
            },
            {
                tags: [
                    {
                        nameTag: 'All Accessories and Equipment',
                        statusTag: true
                    },
                    { nameTag: 'Bags and Backpacks', statusTag: true },
                    { nameTag: 'Socks', statusTag: true },
                    { nameTag: 'Hats and Headwear', statusTag: true }
                ]
            }
        )
        // const result = await databaseService.mainCategories
        //     .find({ language: MENU_LANGUAGES.ENGLISH })
        //     .toArray()
        const result = await databaseService.mainCategories
            .aggregate([
                {
                    $lookup: {
                        from: 'subCategories',
                        localField: '_id',
                        foreignField: 'idMain',
                        as: 'subCategories'
                    }
                }
            ])
            .toArray()
        return result
    }
}

const menuService = new MenuService()
export default menuService

// const mainCategoryDataVN = [
//     {
//         id: 1,
//         name: 'New & Featured',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 2,
//         name: 'Men',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 3,
//         name: 'Woman',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 4,
//         name: 'Kids',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 5,
//         name: 'Sale',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 6,
//         name: 'Customise',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 7,
//         name: 'SNKRS',
//         language: 'vn',
//         status: true
//     }
// ]

// const subCategoryData = [
//     {
//         id: 100,
//         nameSub: 'New & Featured',
//         indexSub: 1,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'New Arrivals', statusTag: true },
//             { nameTag: 'Lastest Shoes', statusTag: true },
//             { nameTag: 'Lastest Cloting', statusTag: true },
//             { nameTag: 'Customise with Nike By You', statusTag: true },
//             { nameTag: 'Best Sellers', statusTag: true },
//             { nameTag: 'Member Exclusive', statusTag: true },
//             { nameTag: 'National Team  Kits', statusTag: true },
//             { nameTag: 'Top Kicks Under 3,000,000đ', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 101,
//         nameSub: 'Shop Icons',
//         indexSub: 2,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'Air Force 1', statusTag: true },
//             { nameTag: 'Air Jordan 1', statusTag: true },
//             { nameTag: 'Air Max', statusTag: true },
//             { nameTag: 'Dunk', statusTag: true },
//             { nameTag: 'Cortez', statusTag: true },
//             { nameTag: 'Blazer', statusTag: true },
//             { nameTag: 'Pegaus', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 102,
//         nameSub: 'New For Men',
//         indexSub: 3,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true },
//             { nameTag: 'Accessories', statusTag: true },
//             { nameTag: 'Show All New', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 103,
//         nameSub: 'New For Women',
//         indexSub: 4,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true },
//             { nameTag: 'Accessories', statusTag: true },
//             { nameTag: 'Show All New', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 104,
//         nameSub: 'New For Kids',
//         indexSub: 5,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true },
//             { nameTag: 'Accessories', statusTag: true },
//             { nameTag: 'Show All New', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 105,
//         nameSub: 'Featured',
//         indexSub: 6,
//         mainCategory: '6656de28a8e605e138c473b2',
//         tags: [
//             { nameTag: 'New Releases', statusTag: true },
//             { nameTag: 'Best Sellers', statusTag: true },
//             { nameTag: 'Member Exclusive', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Lifestyle Running', statusTag: true },
//             { nameTag: 'Customise with Nike By You', statusTag: true },
//             { nameTag: 'Sale', statusTag: true },
//             { nameTag: 'Running Show Finder', statusTag: true },
//             { nameTag: 'Sustainable Materials', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 106,
//         nameSub: 'Shoes',
//         indexSub: 1,
//         mainCategory: '6656de28a8e605e138c473b3',
//         tags: [
//             { nameTag: 'All Shoes', statusTag: true },
//             { nameTag: 'Newest Sneakers', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Lifestyle', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Gym anf Training', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Scandals and Slides', statusTag: true },
//             { nameTag: 'Last Sizes Available', statusTag: true },
//             { nameTag: 'Customise with Nike By You', statusTag: true },
//             { nameTag: 'Top Kicks Under 3,000,000đ', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 107,
//         nameSub: 'Clothing',
//         mainCategory: '6656de28a8e605e138c473b3',
//         indexSub: 2,
//         tags: [
//             { nameTag: 'All Clothing', statusTag: true },
//             { nameTag: 'Tops and T-Shirts', statusTag: true },
//             { nameTag: 'Short', statusTag: true },
//             { nameTag: 'Pants and Leggings', statusTag: true },
//             { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
//             { nameTag: 'Jackets and Gilets', statusTag: true },
//             { nameTag: 'Jerseys and Kits', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 108,
//         nameSub: 'Shop By Sport',
//         mainCategory: '6656de28a8e605e138c473b3',
//         indexSub: 3,
//         tags: [
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Golf', statusTag: true },
//             { nameTag: 'Tennis', statusTag: true },
//             { nameTag: 'Gym anf Training', statusTag: true },
//             { nameTag: 'Yoga', statusTag: true },
//             { nameTag: 'Skateboarding', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 109,
//         nameSub: 'Jordan',
//         indexSub: 4,
//         mainCategory: '6656de28a8e605e138c473b3',
//         tags: [
//             { nameTag: 'All Jordan', statusTag: true },
//             { nameTag: 'New Jordan', statusTag: true },
//             { nameTag: 'Jordan Shoes', statusTag: true },
//             { nameTag: 'Jordan Clothing', statusTag: true },
//             { nameTag: 'Jordan Basketball', statusTag: true },
//             { nameTag: 'Jordan Lifestyle', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 110,
//         nameSub: 'Accessories and Equipment',
//         mainCategory: '6656de28a8e605e138c473b3',
//         indexSub: 5,
//         tags: [
//             { nameTag: 'All Accessories and Equipment', statusTag: true },
//             { nameTag: 'Bags and Backpacks', statusTag: true },
//             { nameTag: 'Socks', statusTag: true },
//             { nameTag: 'Hats and Headwear', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 111,
//         nameSub: 'Shop By Brand',
//         indexSub: 6,
//         mainCategory: '6656de28a8e605e138c473b3',
//         tags: [
//             { nameTag: 'Nike Sportswear', statusTag: true },
//             { nameTag: 'NikeLabs', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'AGG', statusTag: true },
//             { nameTag: 'NBA', statusTag: true },
//             { nameTag: 'Nike SB', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 112,
//         nameSub: 'Featured',
//         mainCategory: '6656de28a8e605e138c473b4',
//         indexSub: 1,
//         tags: [
//             { nameTag: 'New Releases', statusTag: true },
//             { nameTag: 'Best Sellers', statusTag: true },
//             { nameTag: 'Member Exclusive', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Lifestyle Running', statusTag: true },
//             { nameTag: 'Bra and Legging Duos', statusTag: true },
//             { nameTag: 'Customise with Nike By You', statusTag: true },
//             { nameTag: 'Sale', statusTag: true },
//             { nameTag: 'Find Your Feel - Nike Leggings', statusTag: true },
//             { nameTag: 'Running Shoe Finder', statusTag: true },
//             { nameTag: 'Sustainable Materials', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 113,
//         nameSub: 'Shoes',
//         mainCategory: '6656de28a8e605e138c473b4',
//         indexSub: 2,
//         tags: [
//             { nameTag: 'All Shoes', statusTag: true },
//             { nameTag: 'Newest Sneakers', statusTag: true },
//             { nameTag: 'Platform Sneakers', statusTag: true },
//             { nameTag: 'Lifestyle', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Gym anf Training', statusTag: true },
//             { nameTag: 'Scandals and Slides', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Last Sizes Available', statusTag: true },
//             { nameTag: 'Customise with Nike By You', statusTag: true },
//             { nameTag: 'Top Kicks Under 3,000,000đ', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 114,
//         nameSub: 'Clothing',
//         mainCategory: '6656de28a8e605e138c473b4',
//         indexSub: 3,
//         tags: [
//             { nameTag: 'All Clothing', statusTag: true },
//             { nameTag: 'Performance Esstentials', statusTag: true },
//             { nameTag: 'Tops and T-Shirts', statusTag: true },
//             { nameTag: 'Sports Bras', statusTag: true },
//             { nameTag: 'Pants and Leggings', statusTag: true },
//             { nameTag: 'Short', statusTag: true },
//             { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
//             { nameTag: 'Jackets and Gilets', statusTag: true },
//             { nameTag: 'Skirts and Dresses', statusTag: true },
//             { nameTag: 'Modest Wear', statusTag: true },
//             { nameTag: 'Nike Maternity', statusTag: true },
//             { nameTag: 'Plus Size', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 115,
//         nameSub: 'Shop By Sport',
//         indexSub: 4,
//         mainCategory: '6656de28a8e605e138c473b4',
//         tags: [
//             { nameTag: 'Yoga', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Gym anf Training', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Tennis', statusTag: true },
//             { nameTag: 'Golf', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Skateboarding', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 116,
//         nameSub: 'Accessories and Equipment',
//         mainCategory: '6656de28a8e605e138c473b4',
//         indexSub: 5,
//         tags: [
//             { nameTag: 'All Accessories and Equipment', statusTag: true },
//             { nameTag: 'Bags and Backpacks', statusTag: true },
//             { nameTag: 'Socks', statusTag: true },
//             { nameTag: 'Hats and Headwear', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 117,
//         nameSub: 'Shop By Brand',
//         mainCategory: '6656de28a8e605e138c473b4',
//         indexSub: 6,
//         tags: [
//             { nameTag: 'Nike Sportswear', statusTag: true },
//             { nameTag: 'NikeLabs', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'AGG', statusTag: true },
//             { nameTag: 'NBA', statusTag: true },
//             { nameTag: 'Nike SB', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 118,
//         nameSub: 'Featured',
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 1,
//         tags: [
//             { nameTag: 'New Releases', statusTag: true },
//             { nameTag: 'Newest Sneakers', statusTag: true },
//             { nameTag: 'Easy On & Off', statusTag: true },
//             { nameTag: 'Best Sellers', statusTag: true },
//             { nameTag: 'Member Exclusive', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Last Sizes Available', statusTag: true },
//             { nameTag: 'Bags and Backpacks', statusTag: true },
//             { nameTag: 'Sale', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 119,
//         nameSub: "Boys's Shoes",
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 2,
//         tags: [
//             { nameTag: 'All Shoes', statusTag: true },
//             { nameTag: 'Older Boys (7 - 14 years)', statusTag: true },
//             { nameTag: 'Younger Boys (4 - 7 years)', statusTag: true },
//             { nameTag: 'Babies and Toddlers(0 - 4 years)', statusTag: true },
//             { nameTag: 'Lifestyle', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Scandals and Slides', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 120,
//         nameSub: "Girls's Shoes",
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 3,
//         tags: [
//             { nameTag: 'All Shoes', statusTag: true },
//             { nameTag: 'Older Girls (7 - 14 years)', statusTag: true },
//             { nameTag: 'Younger Girls (4 - 7 years)', statusTag: true },
//             { nameTag: 'Babies and Toddlers(0 - 4 years)', statusTag: true },
//             { nameTag: 'Lifestyle', statusTag: true },
//             { nameTag: 'Jordan', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Scandals and Slides', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 121,
//         nameSub: 'Accessories and Equipment',
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 4,
//         tags: [
//             { nameTag: 'All Accessories and Equipment', statusTag: true },
//             { nameTag: 'Bags and Backpacks', statusTag: true },
//             { nameTag: 'Socks', statusTag: true },
//             { nameTag: 'Hats and Headwear', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 122,
//         nameSub: 'Kids By Age',
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 5,
// tags: [
//     { nameTag: 'Olders Kids (7 - 14 years)', statusTag: true },
//     { nameTag: 'Younger Kids (4 - 7 years)', statusTag: true },
//     { nameTag: 'Babies & Toddlers (0 - 4 years)', statusTag: true }
// ],
//         statusSub: true
//     },
//     {
//         id: 123,
//         nameSub: "Boys's Clothing",
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 6,
//         tags: [
//             { nameTag: 'Tops and T-Shirts', status: true },
//             { nameTag: 'Hoodies and Sweatshirts', status: true },
//             { nameTag: 'Pants and Leggings', status: true },
//             { nameTag: 'Shorts', status: true },
//             { nameTag: "All Boys' Clothing", status: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 124,
//         nameSub: "Girls's Clothing",
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 7,
//         tags: [
//             { nameTag: 'Tops and T-Shirts', statusTag: true },
//             { nameTag: 'Sports Bras', statusTag: true },
//             { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
//             { nameTag: 'Pants and Leggings', statusTag: true },
//             { nameTag: 'Shorts', statusTag: true },
//             { nameTag: "All Grils' Clothing", statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 125,
//         nameSub: 'Shop By Sport',
//         mainCategory: '6656de28a8e605e138c473b5',
//         indexSub: 8,
//         tags: [
//             { nameTag: 'Football', statusTag: true },
//             { nameTag: 'Running', statusTag: true },
//             { nameTag: 'Basketball', statusTag: true },
//             { nameTag: 'Gym anf Training', statusTag: true },
//             { nameTag: 'Tennis', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 126,
//         nameSub: 'Sale',
//         mainCategory: '6656de28a8e605e138c473b6',
//         indexSub: 1,
//         tags: [
//             { nameTag: 'Shop All Sale', statusTag: true },
//             { nameTag: 'Shoes Sale', statusTag: true },
//             { nameTag: 'Clothing Sale', statusTag: true },
//             { nameTag: 'Accessories and Equipment Sale', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 127,
//         nameSub: "Men's Sale",
//         indexSub: 2,
//         mainCategory: '6656de28a8e605e138c473b6',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 128,
//         nameSub: "Women's Sale",
//         indexSub: 3,
//         mainCategory: '6656de28a8e605e138c473b6',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true }
//         ],
//         statusSub: true
//     },
//     {
//         id: 129,
//         nameSub: "Kids' Sale",
//         indexSub: 4,
//         mainCategory: '6656de28a8e605e138c473b6',
//         tags: [
//             { nameTag: 'Shoes', statusTag: true },
//             { nameTag: 'Clothing', statusTag: true }
//         ],
//         statusSub: true
//     }
// ]

// const mainCategoryDataEN = [
//     {
//         id: 1,
//         name: 'New & Featured',
//         language: 'en',
//         status: true
//     },
//     {
//         id: 2,
//         name: 'Men',
//         language: 'en',
//         status: true
//     },
//     {
//         id: 3,
//         name: 'Woman',
//         language: 'en',
//         status: true
//     },
//     {
//         id: 4,
//         name: 'Kids',
//         language: 'en',
//         status: true
//     },
//     {
//         id: 5,
//         name: 'Sale',
//         language: 'en',
//         status: true
//     },
//     {
//         id: 5,
//         name: 'Jordan',
//         language: 'en',
//         status: true
//     }
// ]

// const mainCategoryDataVN = [
//     {
//         id: 1,
//         name: 'New & Featured',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 2,
//         name: 'Men',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 3,
//         name: 'Woman',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 4,
//         name: 'Kids',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 5,
//         name: 'Sale',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 6,
//         name: 'Customise',
//         language: 'vn',
//         status: true
//     },
//     {
//         id: 7,
//         name: 'SNKRS',
//         language: 'vn',
//         status: true
//     }
// ]

const subCategoryDataEN = [
    {
        id: 100,
        nameSub: 'Nike Summer Event',
        indexSub: 1,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [{ nameTag: 'Extra 25% Off Select Styles', statusTag: true }],
        statusSub: true
    },
    {
        id: 100,
        nameSub: 'New & Featured',
        indexSub: 2,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'New Arrivals', statusTag: true },
            { nameTag: 'Best Sellers', statusTag: true },
            { nameTag: 'New & Upcoming Drops', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 101,
        nameSub: 'Trending',
        indexSub: 3,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'ACG', statusTag: true },
            { nameTag: 'Life ', statusTag: true },
            { nameTag: 'Air Max', statusTag: true },
            { nameTag: 'Dunk', statusTag: true },
            { nameTag: 'Cortez', statusTag: true },
            { nameTag: 'Blazer', statusTag: true },
            { nameTag: 'Pegaus', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 102,
        nameSub: 'New For Men',
        indexSub: 3,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true },
            { nameTag: 'Accessories', statusTag: true },
            { nameTag: 'Show All New', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 103,
        nameSub: 'New For Women',
        indexSub: 4,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true },
            { nameTag: 'Accessories', statusTag: true },
            { nameTag: 'Show All New', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 104,
        nameSub: 'New For Kids',
        indexSub: 5,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true },
            { nameTag: 'Accessories', statusTag: true },
            { nameTag: 'Show All New', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 105,
        nameSub: 'Featured',
        indexSub: 6,
        mainCategory: '6656de28a8e605e138c473b2',
        tags: [
            { nameTag: 'New Releases', statusTag: true },
            { nameTag: 'Best Sellers', statusTag: true },
            { nameTag: 'Member Exclusive', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Lifestyle Running', statusTag: true },
            { nameTag: 'Customise with Nike By You', statusTag: true },
            { nameTag: 'Sale', statusTag: true },
            { nameTag: 'Running Show Finder', statusTag: true },
            { nameTag: 'Sustainable Materials', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 106,
        nameSub: 'Shoes',
        indexSub: 1,
        mainCategory: '6656de28a8e605e138c473b3',
        tags: [
            { nameTag: 'All Shoes', statusTag: true },
            { nameTag: 'Newest Sneakers', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Lifestyle', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Gym anf Training', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Scandals and Slides', statusTag: true },
            { nameTag: 'Last Sizes Available', statusTag: true },
            { nameTag: 'Customise with Nike By You', statusTag: true },
            { nameTag: 'Top Kicks Under 3,000,000đ', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 107,
        nameSub: 'Clothing',
        mainCategory: '6656de28a8e605e138c473b3',
        indexSub: 2,
        tags: [
            { nameTag: 'All Clothing', statusTag: true },
            { nameTag: 'Tops and T-Shirts', statusTag: true },
            { nameTag: 'Short', statusTag: true },
            { nameTag: 'Pants and Leggings', statusTag: true },
            { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
            { nameTag: 'Jackets and Gilets', statusTag: true },
            { nameTag: 'Jerseys and Kits', statusTag: true },
            { nameTag: 'Jordan', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 108,
        nameSub: 'Shop By Sport',
        mainCategory: '6656de28a8e605e138c473b3',
        indexSub: 3,
        tags: [
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Golf', statusTag: true },
            { nameTag: 'Tennis', statusTag: true },
            { nameTag: 'Gym anf Training', statusTag: true },
            { nameTag: 'Yoga', statusTag: true },
            { nameTag: 'Skateboarding', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 109,
        nameSub: 'Jordan',
        indexSub: 4,
        mainCategory: '6656de28a8e605e138c473b3',
        tags: [
            { nameTag: 'All Jordan', statusTag: true },
            { nameTag: 'New Jordan', statusTag: true },
            { nameTag: 'Jordan Shoes', statusTag: true },
            { nameTag: 'Jordan Clothing', statusTag: true },
            { nameTag: 'Jordan Basketball', statusTag: true },
            { nameTag: 'Jordan Lifestyle', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 110,
        nameSub: 'Accessories and Equipment',
        mainCategory: '6656de28a8e605e138c473b3',
        indexSub: 5,
        tags: [
            { nameTag: 'All Accessories and Equipment', statusTag: true },
            { nameTag: 'Bags and Backpacks', statusTag: true },
            { nameTag: 'Socks', statusTag: true },
            { nameTag: 'Hats and Headwear', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 111,
        nameSub: 'Shop By Brand',
        indexSub: 6,
        mainCategory: '6656de28a8e605e138c473b3',
        tags: [
            { nameTag: 'Nike Sportswear', statusTag: true },
            { nameTag: 'NikeLabs', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'AGG', statusTag: true },
            { nameTag: 'NBA', statusTag: true },
            { nameTag: 'Nike SB', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 112,
        nameSub: 'Featured',
        mainCategory: '6656de28a8e605e138c473b4',
        indexSub: 1,
        tags: [
            { nameTag: 'New Releases', statusTag: true },
            { nameTag: 'Best Sellers', statusTag: true },
            { nameTag: 'Member Exclusive', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Lifestyle Running', statusTag: true },
            { nameTag: 'Bra and Legging Duos', statusTag: true },
            { nameTag: 'Customise with Nike By You', statusTag: true },
            { nameTag: 'Sale', statusTag: true },
            { nameTag: 'Find Your Feel - Nike Leggings', statusTag: true },
            { nameTag: 'Running Shoe Finder', statusTag: true },
            { nameTag: 'Sustainable Materials', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 113,
        nameSub: 'Shoes',
        mainCategory: '6656de28a8e605e138c473b4',
        indexSub: 2,
        tags: [
            { nameTag: 'All Shoes', statusTag: true },
            { nameTag: 'Newest Sneakers', statusTag: true },
            { nameTag: 'Platform Sneakers', statusTag: true },
            { nameTag: 'Lifestyle', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Gym anf Training', statusTag: true },
            { nameTag: 'Scandals and Slides', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Last Sizes Available', statusTag: true },
            { nameTag: 'Customise with Nike By You', statusTag: true },
            { nameTag: 'Top Kicks Under 3,000,000đ', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 114,
        nameSub: 'Clothing',
        mainCategory: '6656de28a8e605e138c473b4',
        indexSub: 3,
        tags: [
            { nameTag: 'All Clothing', statusTag: true },
            { nameTag: 'Performance Esstentials', statusTag: true },
            { nameTag: 'Tops and T-Shirts', statusTag: true },
            { nameTag: 'Sports Bras', statusTag: true },
            { nameTag: 'Pants and Leggings', statusTag: true },
            { nameTag: 'Short', statusTag: true },
            { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
            { nameTag: 'Jackets and Gilets', statusTag: true },
            { nameTag: 'Skirts and Dresses', statusTag: true },
            { nameTag: 'Modest Wear', statusTag: true },
            { nameTag: 'Nike Maternity', statusTag: true },
            { nameTag: 'Plus Size', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 115,
        nameSub: 'Shop By Sport',
        indexSub: 4,
        mainCategory: '6656de28a8e605e138c473b4',
        tags: [
            { nameTag: 'Yoga', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Gym anf Training', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Tennis', statusTag: true },
            { nameTag: 'Golf', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Skateboarding', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 116,
        nameSub: 'Accessories and Equipment',
        mainCategory: '6656de28a8e605e138c473b4',
        indexSub: 5,
        tags: [
            { nameTag: 'All Accessories and Equipment', statusTag: true },
            { nameTag: 'Bags and Backpacks', statusTag: true },
            { nameTag: 'Socks', statusTag: true },
            { nameTag: 'Hats and Headwear', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 117,
        nameSub: 'Shop By Brand',
        mainCategory: '6656de28a8e605e138c473b4',
        indexSub: 6,
        tags: [
            { nameTag: 'Nike Sportswear', statusTag: true },
            { nameTag: 'NikeLabs', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'AGG', statusTag: true },
            { nameTag: 'NBA', statusTag: true },
            { nameTag: 'Nike SB', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 118,
        nameSub: 'Featured',
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 1,
        tags: [
            { nameTag: 'New Releases', statusTag: true },
            { nameTag: 'Newest Sneakers', statusTag: true },
            { nameTag: 'Easy On & Off', statusTag: true },
            { nameTag: 'Best Sellers', statusTag: true },
            { nameTag: 'Member Exclusive', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Last Sizes Available', statusTag: true },
            { nameTag: 'Bags and Backpacks', statusTag: true },
            { nameTag: 'Sale', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 119,
        nameSub: "Boys's Shoes",
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 2,
        tags: [
            { nameTag: 'All Shoes', statusTag: true },
            { nameTag: 'Older Boys (7 - 14 years)', statusTag: true },
            { nameTag: 'Younger Boys (4 - 7 years)', statusTag: true },
            { nameTag: 'Babies and Toddlers(0 - 4 years)', statusTag: true },
            { nameTag: 'Lifestyle', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Scandals and Slides', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 120,
        nameSub: "Girls's Shoes",
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 3,
        tags: [
            { nameTag: 'All Shoes', statusTag: true },
            { nameTag: 'Older Girls (7 - 14 years)', statusTag: true },
            { nameTag: 'Younger Girls (4 - 7 years)', statusTag: true },
            { nameTag: 'Babies and Toddlers(0 - 4 years)', statusTag: true },
            { nameTag: 'Lifestyle', statusTag: true },
            { nameTag: 'Jordan', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Scandals and Slides', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 121,
        nameSub: 'Accessories and Equipment',
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 4,
        tag: [
            { nameTag: 'All Accessories and Equipment', statusTag: true },
            { nameTag: 'Bags and Backpacks', statusTag: true },
            { nameTag: 'Socks', statusTag: true },
            { nameTag: 'Hats and Headwear', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 122,
        nameSub: 'Kids By Age',
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 5,
        tags: [
            { nameTag: 'Olders Kids (7 - 14 years)', statusTag: true },
            { nameTag: 'Younger Kids (4 - 7 years)', statusTag: true },
            { nameTag: 'Babies & Toddlers (0 - 4 years)', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 123,
        nameSub: "Boys's Clothing",
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 6,
        tags: [
            { nameTag: 'Tops and T-Shirts', status: true },
            { nameTag: 'Hoodies and Sweatshirts', status: true },
            { nameTag: 'Pants and Leggings', status: true },
            { nameTag: 'Shorts', status: true },
            { nameTag: "All Boys' Clothing", status: true }
        ],
        statusSub: true
    },
    {
        id: 124,
        nameSub: "Girls's Clothing",
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 7,
        tags: [
            { nameTag: 'Tops and T-Shirts', statusTag: true },
            { nameTag: 'Sports Bras', statusTag: true },
            { nameTag: 'Hoodies and Sweatshirts', statusTag: true },
            { nameTag: 'Pants and Leggings', statusTag: true },
            { nameTag: 'Shorts', statusTag: true },
            { nameTag: "All Grils' Clothing", statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 125,
        nameSub: 'Shop By Sport',
        mainCategory: '6656de28a8e605e138c473b5',
        indexSub: 8,
        tags: [
            { nameTag: 'Football', statusTag: true },
            { nameTag: 'Running', statusTag: true },
            { nameTag: 'Basketball', statusTag: true },
            { nameTag: 'Gym anf Training', statusTag: true },
            { nameTag: 'Tennis', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 126,
        nameSub: 'Sale',
        mainCategory: '6656de28a8e605e138c473b6',
        indexSub: 1,
        tags: [
            { nameTag: 'Shop All Sale', statusTag: true },
            { nameTag: 'Shoes Sale', statusTag: true },
            { nameTag: 'Clothing Sale', statusTag: true },
            { nameTag: 'Accessories and Equipment Sale', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 127,
        nameSub: "Men's Sale",
        indexSub: 2,
        mainCategory: '6656de28a8e605e138c473b6',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 128,
        nameSub: "Women's Sale",
        indexSub: 3,
        mainCategory: '6656de28a8e605e138c473b6',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true }
        ],
        statusSub: true
    },
    {
        id: 129,
        nameSub: "Kids' Sale",
        indexSub: 4,
        mainCategory: '6656de28a8e605e138c473b6',
        tags: [
            { nameTag: 'Shoes', statusTag: true },
            { nameTag: 'Clothing', statusTag: true }
        ],
        statusSub: true
    }
]
