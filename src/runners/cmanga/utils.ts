import {Chapter, ChapterImage, ChapterInfo, Gallery, GalleryInfo, TranslatorInfo, TranslatorResponse} from "./type";
import {UserId} from "./constants";

export function parseGalleries(galleries: Gallery[]): Gallery[] {
    return galleries.map((gallery: Gallery) => ({
        ...gallery,
        info: JSON.parse(String(gallery.info)) as GalleryInfo
    }));
}

export function parseChapters(chapters: Chapter[]): ChapterInfo[] {
    return chapters.map((chapter: Chapter) => (JSON.parse(String(chapter.info)) as ChapterInfo));
}

export function parseGallery(gallery: Gallery): GalleryInfo {
    return JSON.parse(String(gallery.info)) as GalleryInfo;
}

export function parseTranslator(translator: TranslatorResponse): TranslatorInfo {
    return JSON.parse(String(translator.info)) as TranslatorInfo;
}

export function parseChapterImages(chapterImage: ChapterImage): string[] {
    return chapterImage.image
}

export async function isLoggedIn(): Promise<boolean> {
    const userId = await SecureStore.string(UserId);
    return userId != null
}
