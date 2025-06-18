export interface GetGalleryListRequest {
    num_chapter?: number;
    sort?: string;
    type?: string;
    tag?: string;
    team?: string;
    limit?: number;
    page?: number;
    user?: number;
}

export interface Statics {
    view: number;
    follow: string;
}

export interface GalleryInfo {
    id: number;
    url: string;
    name: string;
    tags: string[];
    team: string;
    avatar: string;
    detail: string;
    status: string;
    chapter: {
        id: string;
        last: string;
    };
    statics: {
        like: number;
        view: number;
        follow: number;
        unlock: number;
        comment: number;
    };
    name_other: string[];
}

export interface Gallery {
    id_album: string;
    info: GalleryInfo;
    last_update: string;
    score: string;
}

export interface ChapterInfo {
    name: string;
    type: string;
    source: string;
    num: string;
    last_update: string;
    album: string;
    hidden: number;
    upload: number;
    upload_time: number;
    statics: {
        view: number;
    };
    id: string;
    upload_num: number;
}

export interface Chapter {
    id_chapter?: string;
    info?: ChapterInfo;
    last?: string;
    id?: string;
}

export interface ChapterImage {
    image: string[];
}


export interface Genre {
    name: string;
    url: string;
    detail: string;
    important: number;
    string: string;
}

export interface UserData {
    country: string;
    language: string;
    avatar: string;
    name: string
}


export interface TranslatorResponse {
    info: string;
}

export interface TranslatorInfo {
    name?: string;
}