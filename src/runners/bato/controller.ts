import {
  ChapterData,
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  PageSection,
  PagedResult,
  Property, NetworkRequestConfig,
} from "@suwatte/daisuke";
import {
  ADULT_TAGS,
  CONTENT_TYPE_TAGS,
  DEMOGRAPHIC_TAGS,
  GENERIC_TAGS,
  HOME_PAGE_SECTIONS,
  LANG_TAGS,
  ORIGIN_TAGS,
  STATUS_TAGS,
} from "./constants";
import { Parser } from "./parser";
import { load } from "cheerio";

export class Controller {
  private BASE = "https://bato.to";
  private client = new NetworkClient();
  private parser = new Parser();

  async buildHomePageSections() {
    const $ = await this.fetchHTML(this.BASE);
    const sections: PageSection[] = [];
    for (const section of HOME_PAGE_SECTIONS) {
      const items = this.parser.getHomepageSection($, section.id);
      sections.push({ ...section, items });
    }
    return sections;
  }

  async getSearchResults(request: DirectoryRequest): Promise<PagedResult> {
    const params: Record<string, any> = {};

    // Keyword
    if (request.query) {
      params["word"] = request.query;
    }

    // Page
    if (request.page) {
      params["page"] = request.page;
    }

    const filters = request.filters ?? [];
    const genres: string[] = [];

    if (filters) {
      const genreFilterIds = ["content_type", "demographic", "adult", "general"];

      for (const filterId of genreFilterIds) {
        const value = filters[filterId] as {
          included?: string[];
        };
        if (value?.included) {
          genres.push(...value.included);
        }
      }

      if (filters.origin) {
        params.origs = filters.origin;
      }

      if (filters.translated) {
        params.lang = filters.translated;
      }

      if (filters.status) {
        params.release = filters.status;
      }
    }

    if (request.tag) {
      genres.push(request.tag.tagId);
    }

    if (genres.length > 0) {
      params.genres = genres.join(",");
    }

    params.sort = request.sort?.id ?? "update";

    const { data: html } = await this.client.get(`${this.BASE}/browse`, {
      params,
    });

    const results = this.parser.parsePagedResponse(html);
    const $ = load(html);
    const isLastPage = this.parser.isLastPage($);
    return { results, isLastPage };
  }

  getFilters(): DirectoryFilter[] {
    return [
      {
        id: "content_type",
        title: "Content Type",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: CONTENT_TYPE_TAGS,
      },
      {
        id: "demographic",
        title: "Demographics",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: DEMOGRAPHIC_TAGS,
      },
      {
        id: "adult",
        title: "Mature",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: ADULT_TAGS,
      },
      {
        id: "general",
        title: "Genres",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: GENERIC_TAGS,
      },
      {
        id: "origin",
        title: "Original Language",
        type: FilterType.SELECT,
        options: ORIGIN_TAGS,
      },
      {
        id: "translated",
        title: "Translated Language",
        subtitle:
          "NOTE: When Selected, This will override your language preferences",
        type: FilterType.SELECT,
        options: LANG_TAGS,
      },
      {
        id: "status",
        title: "Content Status",
        type: FilterType.SELECT,
        options: STATUS_TAGS,
      },
    ];
  }

  getProperties(): Property[] {
    return [
      {
        id: "content_type",
        title: "Content Type",
        tags: CONTENT_TYPE_TAGS,
      },
      {
        id: "demographic",
        title: "Demographics",
        tags: DEMOGRAPHIC_TAGS,
      },
      {
        id: "adult",
        title: "Mature",
        tags: ADULT_TAGS,
      },
      {
        id: "general",
        title: "Genres",
        tags: GENERIC_TAGS,
      },
      {
        id: "origin",
        title: "Original Language",
        tags: ORIGIN_TAGS,
      },
      {
        id: "translated",
        title: "Translated Language",
        tags: LANG_TAGS,
      },
      {
        id: "status",
        title: "Content Status",
        tags: STATUS_TAGS,
      },
    ];
  }

  async getContent(id: string) {
    const response = await this.fetchHTML(`${this.BASE}/series/${id}`);
    return this.parser.parseContent(response, id);
  }

  async getChapters(id: string) {
    const response = await this.fetchHTML(`${this.BASE}/series/${id}`);
    return this.parser.parseChapters(response);
  }

  async getChapterData(chapterId: string): Promise<ChapterData> {
    const response = await this.fetchHTML(`${this.BASE}/chapter/${chapterId}`);
    return {
      pages: this.parser.parsePages(response),
    };
  }

  private async fetchHTML(url: string, config?: NetworkRequestConfig) {
    try {
      console.log(`Requesting to the url: ${url}${config ? ", config: " + JSON.stringify(config) : ""}`)
      const response = await this.client.get(url, config);
      return load(response.data);
    } catch (ex) {
      const err = <NetworkError>ex
      if (err?.res?.status == 404) {
        return load('')
      }
      console.error('Error occurred during JSON request:', err);
      throw ex;
    }
  }
}
