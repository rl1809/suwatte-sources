import {NetworkRequest, NetworkRequestConfig} from "@suwatte/daisuke";
import {
    API_ALBUM_SUGGEST,
    API_CHAPTER_IMAGE,
    API_CHAPTER_LIST,
    API_GET_DATA_BY_ID,
    API_GET_TAGS,
    API_GET_USER_DATA,
    API_GET_USER_LIST,
    API_HOME_ALBUM_LIST,
    API_HOME_ALBUM_TOP,
    API_LOGIN,
    API_SEARCH,
    API_USER_OPERATION,
    Avatar,
    BATCH_SIZE_GET_CHAPTER_LIST,
    Name,
    Password,
    UserId,
    UserName
} from "./constants";
import {load} from "cheerio";
import {parseChapterImages, parseChapters, parseGalleries, parseGallery, parseTranslator} from "./utils";
import {GlobalStore} from "./store";
import {
    ChapterImage,
    ChapterInfo,
    Gallery,
    GalleryInfo,
    Genre,
    GetGalleryListRequest,
    TranslatorInfo,
    UserData
} from "./type";

export class API {
    private client = new NetworkClient()

    async handleAuth(username?: string | null, password?: string | null) {
        const domain = await GlobalStore.getDomain();
        if (!username || !password) {
            username = await SecureStore.string(UserName)
            password = await SecureStore.string(Password)
        }
        if (!username || !password) {
            return
        }

        const request = {
            url: domain + API_LOGIN,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-requested-with": "XMLHttpRequest"
            },
            body: {
                action: "login",
                username: username,
                password: password,
            },
            method: "POST"
        }
        console.log(`Performing a request: ${JSON.stringify(request)}`)
        await this.client.request(request)
        const userId = await this.getUserId()
        const userData = await this.getUserData(userId)
        await SecureStore.set(UserName, username)
        await SecureStore.set(Password, password)
        await SecureStore.set(UserId, userId)
        await SecureStore.set(Name, userData.name)
        await SecureStore.set(Avatar, userData.avatar)
    }

    async getUserData(userId: string): Promise<UserData> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain}${API_GET_USER_DATA}?data=info&user=${userId}`
        return this.requestJSON({url, method: "GET"});
    }


    async getGalleryInfo(galleryId: string): Promise<GalleryInfo> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_GET_DATA_BY_ID}?id=${galleryId}&table=album&data=info`
        const response = await this.requestJSON({url, method: "GET"});
        return parseGallery(response)
    }

    async getTranslatorInfo(translatorId: string): Promise<TranslatorInfo> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_GET_DATA_BY_ID}?id=${translatorId}&table=team&data=info`
        const response = await this.requestJSON({url, method: "GET"});
        return parseTranslator(response)
    }

    async getGalleryList(request: GetGalleryListRequest): Promise<Gallery[]> {
        const domain = await GlobalStore.getDomain()
        const queryString = Object.entries(request)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        const url = `${domain + API_HOME_ALBUM_LIST}?${queryString}`
        const json = await this.requestJSON(
            {
                url,
                method: "GET"
            }
        )
        return parseGalleries(json.data)
    }

    async getSuggestGalleryList(): Promise<Gallery[]> {
        const userId = await SecureStore.string(UserId)
        if (!userId) {
            return []
        }
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_ALBUM_SUGGEST}?user=${userId}`
        const galleries = await this.requestJSON({url, method: "GET"});
        return parseGalleries(galleries.data)
    }

    async getUserGalleryList(type: string, page: number): Promise<Gallery[]> {
        const userId = await SecureStore.string(UserId)
        if (!userId) {
            return []
        }
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_GET_USER_LIST}?type=${type}&limit=20&user=${userId}&page=${page}`
        const galleries = await this.requestJSON({url, method: "GET"});
        return parseGalleries(galleries.data)
    }

    async getTopGalleryList(type: string): Promise<Gallery[]> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_HOME_ALBUM_TOP}?type=${type}&limit=10`
        const response = await this.requestJSON({url, method: "GET"});
        return parseGalleries(response.data)
    }

    async getSearchGalleries(keyword: string): Promise<Gallery[]> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_SEARCH}?string=${encodeURI(keyword)}&type=album`
        const response = await this.requestJSON({url, method: "GET"});
        return parseGalleries(response)

    }

    async getChapterList(galleryId: string, page: number): Promise<ChapterInfo[]> {
        const domain = await GlobalStore.getDomain()
        const id = galleryId.split("-").pop() || "0"
        const url = `${domain + API_CHAPTER_LIST}?album=${id}&page=${page}&limit=${BATCH_SIZE_GET_CHAPTER_LIST}`
        const response = await this.requestJSON({url, method: "GET"});
        return parseChapters(response)

    }

    async getChapterImages(chapterId: string): Promise<string[]> {
        const domain = await GlobalStore.getDomain()
        const url = `${domain + API_CHAPTER_IMAGE}?chapter=${chapterId}&v=0`
        const chapterImage: ChapterImage = await this.requestJSON({url, method: "GET"});
        const images = parseChapterImages(chapterImage)
        void this.preload(images)
        return images
    }

    async preload(chapterImages: string[]) {
        const domain = await GlobalStore.getDomain()
        for (const url of chapterImages) {
            void this.client.get(url, {headers: {Referer: domain + "/"}})
        }
    }

    async getGenres(): Promise<Record<string, Genre>> {
        const domain = await GlobalStore.getDomain()
        const url = domain + API_GET_TAGS
        return this.requestJSON({url, method: "GET"});
    }

    async getUserId() {
        const $ = await this.fetchHTML(await GlobalStore.getDomain())
        const scriptTag = $('script:contains("token_user")');
        let userId = '';
        if (scriptTag.length > 0) {
            const scriptContent = scriptTag.html();
            if (scriptContent) {
                // Extract the value of token_user using regex
                const match = scriptContent.match(/token_user\s*=\s*(\d+);/);
                if (match && match.length > 1) {
                    userId = match[1] || "";
                }
            }
        }
        return userId
    }

    async markChapterAsRead(chapterId: string) {
        const domain = await GlobalStore.getDomain()
        const request = {
            url: domain + API_USER_OPERATION,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-requested-with": "XMLHttpRequest"
            },
            body: {
                action: "chapter_view",
                chapter_id: chapterId,
            },
            method: "POST"
        }
        console.log(`Performing a request: ${JSON.stringify(request)}`)
        await this.client.request(request)
    }

    async followManga(contentId: string) {
        const domain = await GlobalStore.getDomain()
        const request = {
            url: domain + API_USER_OPERATION,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "x-requested-with": "XMLHttpRequest"
            },
            body: {
                action: "album_follow",
                album: contentId,
                follow_check: 1,
            },
            method: "POST"
        }
        console.log(`Performing a request: ${JSON.stringify(request)}`)
        await this.client.request(request)
    }

    async fetchHTML(url: string, config?: NetworkRequestConfig) {
        console.log(`Requesting to the url: ${url}${config ? ", config: " + JSON.stringify(config) : ""}`)
        const response = await this.client.get(url, config);
        return load(response.data);
    }

    private async requestJSON(request: NetworkRequest) {
        try {
            console.log(`Performing JSON request: ${JSON.stringify(request)}`);
            const {data: resp} = await this.client.request(request);
            return JSON.parse(resp) ?? resp;
        } catch (ex) {
            const err = <NetworkError>ex
            console.error('Error occurred during JSON request:', err);
            throw ex;
        }
    }
}
