export const convertFilesToBuffers = (files: ArrayBuffer[]): Promise<Buffer[]> => {
    return Promise.all(
        files.map(file => {
            return new Promise<Buffer>((resolve, reject) => {
                resolve(Buffer.from(new Uint8Array(file)))
            });
        })
    );
};