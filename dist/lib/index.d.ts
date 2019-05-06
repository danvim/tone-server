declare global {
    namespace NodeJS {
        interface Global {
            File: any;
            Blob: any;
            FileReader: any;
            postMessage: (k: any[]) => any;
            test: boolean;
        }
    }
}
export {};
