import {Target} from "../runners/ehentai";
import emulate from "@suwatte/emulator";
import {DirectoryRequest} from "@suwatte/daisuke";
import {ChapterDataSchema, ChapterSchema, PagedResultSchema} from "@suwatte/validate";

describe("E-Hentai Tests", () => {
    const source = emulate(Target);

    test("Query", async () => {
        const filters: DirectoryRequest = {
            tag: {
                tagId: "Image Set",
                propertyId: "category"
            },
            page: 1
        }
        const data = await source.getDirectory(filters)
        expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    });

    test("Profile", async () => {
        const data = await source.getTags()
        expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    });

    test("Chapters", async () => {
        const chapters = await source.getChapters("72315");
        expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
        expect(chapters.length).toBeGreaterThan(1);
    });

    test("Reader", async () => {
        const data = await source.getChapterData("84565", "2176683");
        expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
    });
});
