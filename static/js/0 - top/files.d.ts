type StreamOptions = {
    headers?: {
        [key: string]: string;
    };
};
declare function fileStream(url: string, files: FileList, options?: StreamOptions): Promise<void>;
//# sourceMappingURL=files.d.ts.map