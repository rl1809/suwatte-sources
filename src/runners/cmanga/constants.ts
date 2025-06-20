import {DirectoryFilter, FilterType, Option, PageSection, PublicationStatus, SectionStyle,} from "@suwatte/daisuke";

export const CMANGA_DOMAIN = "https://cmangam.com";

export const API_LOGIN = "/assets/ajax/user.php"
export const API_GET_USER_DATA = "/api/user_data"
export const API_USER_OPERATION = "/assets/ajax/user.php"
export const API_GET_USER_LIST = "/api/user_list"
export const API_ALBUM_SUGGEST = "/api/user_album_suggest"
export const API_HOME_ALBUM_LIST = "/api/home_album_list"
export const API_HOME_ALBUM_TOP = "/api/home_album_top"
export const API_CHAPTER_LIST = "/api/chapter_list"
export const API_CHAPTER_IMAGE = "/api/chapter_image"
export const API_SEARCH = "/api/search"
export const API_GET_TAGS = "/api/data?data=album_tags"
export const API_GET_DATA_BY_ID = "/api/get_data_by_id"

export const UserId = "user_id"
export const Name = "name"

export const UserName = "user_name"
export const Password = "password"

export const Avatar = "avatar"


export const BATCH_SIZE_GET_CHAPTER_LIST = 500

export const STATUS_KEYS: Record<string, PublicationStatus> = {
    "doing": PublicationStatus.ONGOING,
    "completed": PublicationStatus.COMPLETED,
};

export const VERTICAL_TYPES = ["manhwa", "manhua", "truyện màu", "webtoon", "huyền huyễn"];


export const PREF_KEYS = {
    cache_request: "request",
    domain: "domain",
    show_translator: "show_translator",
    show_related_galleries: "show_related_galleries",
};

export const HOME_PAGE_SECTIONS: PageSection[] = [
    {
        id: "suggest",
        title: "Gợi Ý Thông Minh",
        style: SectionStyle.INFO,
    },
    {
        id: "unique",
        title: "Độc Quyền",
        style: SectionStyle.GALLERY,
    },
    {
        id: "month",
        title: "Top Tháng",
        style: SectionStyle.GALLERY,
    },
    {
        id: "update",
        title: "Truyện Mới Cập Nhật",
        style: SectionStyle.PADDED_LIST,
        viewMoreLink: {request: {page: 1, sort: {id: ""}}},
    },
];

export const SEARCH_SORTERS: Option[] = [
    {
        id: "update",
        title: "Thời gian đăng",
    },
    {
        id: "follow",
        title: "Lượt theo dõi",
    },
    {
        id: "view",
        title: "Lượt xem",
    },
];

export const DEFAULT_FILTERS: DirectoryFilter[] = [
    {
        id: "minchapter",
        title: "Số chapter tối thiểu",
        type: FilterType.TEXT
    },
];

export const USER_LIST: Option[] = [
    {
        "id": "album_follow",
        "title": "Truyện theo dõi"
    },
    {
        "id": "album_history",
        "title": "Truyện đã đọc"
    }
]
