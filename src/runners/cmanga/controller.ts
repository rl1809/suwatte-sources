import {
    Content,
    DirectoryFilter,
    DirectoryRequest,
    FilterType,
    Highlight,
    Option,
    PagedResult,
    PageSection,
    User
} from "@suwatte/daisuke";
import {Avatar, DEFAULT_FILTERS, HOME_PAGE_SECTIONS, Name, Password, PREF_KEYS, UserId, UserName} from "./constants";
import {Parser} from "./parser";
import {API} from "./api";
import memoryCache, {CacheClass} from "memory-cache";
import {GlobalStore} from "./store";
import {ChapterInfo, GalleryInfo, GetGalleryListRequest} from "./type";
import {getRandomRecords} from "../../utils/utils";

export class Controller {
    private api = new API()
    private cache: CacheClass<string, DirectoryRequest | Option[]> = new memoryCache.Cache();
    private parser = new Parser();


    async buildHomePageSections() {
        const promises: Promise<void>[] = []
        const sections: PageSection[] = [];

        for (const section of HOME_PAGE_SECTIONS) {
            switch (section.id) {
                case "suggest":
                    promises.push(
                        this.api.getSuggestGalleryList().then(async (galleries) => {
                            const items = await this.parser.getSearchResults(galleries)
                            sections.push({...section, items})
                        })
                    )
                    break;
                case "update":
                    promises.push(this.api.getGalleryList(
                            {
                                num_chapter: 0,
                                sort: section.id,
                                tag: "",
                                limit: 20,
                                page: 1,
                                user: 0,
                            }
                        ).then(async (galleries) => {
                            const items = await this.parser.getSearchResults(galleries)
                            sections.push({...section, items})
                        })
                    )
                    break;
                case "unique":
                    promises.push(this.api.getGalleryList(
                            {
                                num_chapter: 0,
                                type: section.id,
                                tag: "",
                                limit: 20,
                                page: 1,
                                user: 0,
                            }
                        ).then(async (galleries) => {
                            const items = await this.parser.getSearchResults(galleries)
                            sections.push({...section, items})
                        })
                    )
                    break;
                case "day":
                case "month":
                case "total":
                    promises.push(
                        this.api.getTopGalleryList(section.id).then(async (galleries) => {
                            const items = await this.parser.getSearchResults(galleries)
                            sections.push({...section, items})
                        })
                    )
                    break;
            }
        }
        promises.push(this.api.handleAuth())
        await Promise.all(promises)
        const sectionIdInOrder = HOME_PAGE_SECTIONS.map((section) => {
            return section.id
        })
        sections.sort((a, b) => sectionIdInOrder.indexOf(a.id) - sectionIdInOrder.indexOf(b.id));
        return sections.filter(a => a.items?.length);
    }

    async getSearchResults(request: DirectoryRequest): Promise<PagedResult> {
        const results = await this.getGalleries(request)

        return {
            results: results,
            isLastPage: false
        };
    }

    async getGalleries(request: DirectoryRequest): Promise<Highlight[]> {
        // eslint-disable-next-line prefer-const
        let {listId, filters, query, tag, sort, page} = request

        if (listId) {
            const galleries = await this.api.getUserGalleryList(listId, page)
            return this.parser.getSearchResults(galleries, true)
        }

        const getGalleryList: GetGalleryListRequest = {user: 0, limit: 20, page: page}

        if (!filters && !query && !tag && sort && sort.id) {
            request = <DirectoryRequest>this.cache.get(PREF_KEYS.cache_request) ?? request
            tag = request.tag
            filters = request.filters
            query = request.query
        }

        if (sort && sort.id) {
            getGalleryList.sort = sort.id
        }

        if (filters) {
            getGalleryList.tag = filters.genre
            getGalleryList.num_chapter = Number(filters.minchapter)
        }

        if (query) {
            const galleries = await this.api.getSearchGalleries(query)
            this.cache.put(PREF_KEYS.cache_request, request)
            return this.parser.getSearchResults(galleries, true)
        }

        if (tag) {
            if (tag.propertyId == "translator") {
                getGalleryList.team = tag.tagId
            } else {
                getGalleryList.tag = tag.tagId
            }
        }

        const galleries = await this.api.getGalleryList(getGalleryList)
        this.cache.put(PREF_KEYS.cache_request, request)
        return this.parser.getSearchResults(galleries, true)
    }

    async getGenres(): Promise<Option[]> {
        const genres = await this.api.getGenres()
        return Object.values(genres).map(genre => ({id: genre.string, title: genre.name}))
    }

    async getFilters(): Promise<DirectoryFilter[]> {
        const filters = DEFAULT_FILTERS
        const genres = await this.getGenres()
        filters.push({id: "genre", title: "Thể loại", type: FilterType.SELECT, options: genres})
        return filters
    }

    // Content
    async getContent(contentId: string): Promise<Content> {
        const pagePromises = [];
        pagePromises.push(this.api.getGalleryInfo(contentId))
        for (let i = 1; i <= 10; i++) {
            pagePromises.push(this.api.getChapterList(contentId, i));
        }
        const galleryInfoWithChapters = await Promise.all(pagePromises);
        const galleryInfo = <GalleryInfo>galleryInfoWithChapters[0]
        const chapters: ChapterInfo[] = []
        galleryInfoWithChapters.slice(1).forEach(chaptersPage => {
            chapters.push(...<ChapterInfo[]>chaptersPage);
        });
        const showTranslator = await GlobalStore.getShowTranslator()
        if (showTranslator && galleryInfo.team) {
            const [translatorInfo, relatedGalleries] = await Promise.all([
                this.api.getTranslatorInfo(galleryInfo.team),
                this.api.getGalleryList(
                    {
                        team: galleryInfo.team,
                        limit: 20,
                        page: Math.floor(Math.random() * 5) + 1,
                    }
                )
            ])
            return this.parser.getContent(galleryInfo, chapters, translatorInfo, getRandomRecords(relatedGalleries, 5));
        }
        return this.parser.getContent(galleryInfo, chapters);
    }

    async getChapterData(chapterId: string) {
        const chapterImages = await this.api.getChapterImages(chapterId)
        return this.parser.getChapterData(chapterImages);
    }

    async handleAuth(username: string, password: string) {
        await this.api.handleAuth(username, password)
    }

    async handleSignOut() {
        await SecureStore.remove(UserName)
        await SecureStore.remove(Password)
        await SecureStore.remove(UserId)
        await SecureStore.remove(Name)
        await SecureStore.remove(Avatar)

    }

    async getAuthUser() {
        const domain = await GlobalStore.getDomain()
        const userId = await SecureStore.get(UserId);
        if (!userId) {
            return null;
        }

        const name = await SecureStore.string(Name) || "";
        const avatar = `${domain}/assets/tmp/avatar/${await SecureStore.string(Avatar) || ""}`

        const user: User = {
            handle: name,
            avatar: avatar
        };

        return user;
    }

    async markChapterAsRead(chapterId: string) {
        return this.api.markChapterAsRead(chapterId)
    }

    async followManga(contentId: string) {
        return this.api.followManga(contentId)
    }
}
