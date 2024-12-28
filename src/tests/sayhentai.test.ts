import {Target} from "../runners/sayhentai";
import emulate from "@suwatte/emulator";
import {DirectoryRequest} from "@suwatte/daisuke";
import {ChapterDataSchema, ChapterSchema, ContentSchema, PagedResultSchema} from "@suwatte/validate";

describe("SayHentai Tests", () => {
    const source = emulate(Target);


    test("Homepage", async (): Promise<void> => {
        const sections = await source.getSectionsForPage({id: "home"})
        console.log(sections)
    });

    test("Query", async () => {
        const filters: DirectoryRequest = {
            tag: {
                tagId: "https://sayhentai.co/genre/historical",
                propertyId: "genres"
            },
            page: 1
        }
        const data = await source.getDirectory(filters)
        expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    });

    test("Profile", async () => {
        const content = await source.getContent("https://sayhentai.co/truyen-giao-thuong-thieu-nu-sa-nga-chua-tung-duoc-su-dung.html");
        expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
    });

    test("Chapters", async () => {
        const chapters = await source.getChapters("72315");
        expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
        expect(chapters.length).toBeGreaterThan(1);
    });

    test("Reader", async () => {
        const data = await source.getChapterData("-", "820095");
        expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
    });

});
