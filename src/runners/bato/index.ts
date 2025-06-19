import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  PageLink,
  PageLinkResolver,
  PageSection,
  PagedResult,
  Property,
  RunnerInfo, ResolvedPageSection,
} from "@suwatte/daisuke";
import { SORTERS } from "./constants";
import { Controller } from "./controller";

export class Target implements ContentSource, PageLinkResolver {
  info: RunnerInfo = {
    id: "to.bato",
    name: "Bato",
    version: 0.7,
    website: "https://bato.to",
    supportedLanguages: [],
    thumbnail: "bato.png",
    minSupportedAppVersion: "5.0",
  };

  private controller = new Controller();
  getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }
  getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    return this.controller.getChapterData(chapterId);
  }

  async getTags?(): Promise<Property[]> {
    return this.controller.getProperties();
  }

  getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(request);
  }
  async getDirectoryConfig(
    _configID?: string | undefined
  ): Promise<DirectoryConfig> {
    return {
      filters: this.controller.getFilters(),
      sort: {
        options: SORTERS,
        canChangeOrder: false,
        default: {
          id: "update",
        },
      },
    };
  }

  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id === "home") {
      return this.controller.buildHomePageSections();
    }
    throw new Error("Requested page not supported");
  }

  resolvePageSection(
      _link: PageLink,
      _sectionKey: string
  ): Promise<ResolvedPageSection> {
    throw new Error("already resolved");
  }
}
