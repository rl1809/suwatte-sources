import {CMANGA_DOMAIN, PREF_KEYS} from "./constants";

export class Store {
    async getDomain() {
        const value = await ObjectStore.string(PREF_KEYS.domain);
        if (!value) {
            return CMANGA_DOMAIN
        }
        return value
    }

    async setDomain(domain: string) {
        if (!this.isValidDomain(domain.trim())) {
            await ObjectStore.set(PREF_KEYS.domain, CMANGA_DOMAIN);
            return;
        }
        await ObjectStore.set(PREF_KEYS.domain, domain.trim());
    }

    isValidDomain(domain: string): boolean {
        // Regular expression for matching a valid domain with http or https
        const domainRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Test the domain against the regex
        return domainRegex.test(domain);
    }

    async getShowTranslator(): Promise<boolean> {
        const value = await ObjectStore.boolean(PREF_KEYS.show_translator);
        return !!value;
    }

    async setShowTranslator(v: boolean) {
        return ObjectStore.set(PREF_KEYS.show_translator, v);
    }

    async getShowRelatedGalleries(): Promise<boolean> {
        const value = await ObjectStore.boolean(PREF_KEYS.show_related_galleries);
        return !!value;
    }

    async setShowRelatedGalleries(v: boolean) {
        return ObjectStore.set(PREF_KEYS.show_related_galleries, v);
    }
}

export const GlobalStore = new Store();
