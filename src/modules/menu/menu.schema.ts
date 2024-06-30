import { ObjectId } from "mongodb";
import { MENU_LANGUAGES } from "./menu.enum";

type MainCategoryType = {
    _id?: ObjectId;
    index: number;
    nameMain: string;
    language: MENU_LANGUAGES;
    route: string;
    status: boolean;
};

export class MainCategory {
    _id?: ObjectId;
    nameMain: string;
    index: number;
    language: MENU_LANGUAGES;
    route: string;
    status: boolean;

    constructor(data: MainCategoryType) {
        this._id = data._id;
        this.index = data.index;
        this.nameMain = data.nameMain;
        this.route = data.route;
        this.language = data.language;
        this.status = data.status;
    }
}

type SubCategoryType = {
    _id?: ObjectId;
    idMain: ObjectId;
    indexSub: number;
    nameSub: string;
    tags: TagType[];
    statusSub: boolean;
};

export class SubCategory {
    _id?: ObjectId;
    idMain: ObjectId;
    indexSub: number;
    tags: TagType[];

    nameSub: string;
    statusSub: boolean;

    constructor(data: SubCategoryType) {
        this._id = data._id;
        this.indexSub = data.indexSub;
        this.idMain = data.idMain;
        this.tags = data.tags;
        this.nameSub = data.nameSub;
        this.statusSub = data.statusSub;
    }
}

export type TagType = {
    nameTag: string;
    statusTag: boolean;
};
