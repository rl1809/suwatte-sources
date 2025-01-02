import {Chapter, ChapterImage, ChapterInfo, Gallery, Info} from "./type";
import {UserId} from "./constants";

export function parseGalleries(galleries: Gallery[]): Gallery[] {
    return galleries.map((gallery: Gallery) => ({
        ...gallery,
        info: JSON.parse(String(gallery.info)) as Info
    }));
}

export function parseChapters(chapters: Chapter[]): ChapterInfo[] {
    return chapters.map((chapter: Chapter) => (JSON.parse(String(chapter.info)) as ChapterInfo));
}

export function parseChapterImages(chapterImage: ChapterImage): string[] {
    return chapterImage.image
}

export async function isLoggedIn(): Promise<boolean> {
    const userId = await SecureStore.string(UserId);
    return userId != null
}
