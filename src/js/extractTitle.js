export default class {
    constructor(PDFJS) {
        this.PDFJS = PDFJS;
    }

    static getMetadata (url) {
        if (!this.PDFJS) {
            console.error('Missing PDFJS.');
            return 0;
        }
        let pdf = this.PDFJS.getDocument(url);
        return new Promise(resovle => {
            pdf.promise.then(value => {
                let metadata = value.getMetadata();
                metadata.then(val => {
                    resovle(val.info);
                });
            });
        });
    }
    
    static getSegment(url) {
        if (!this.PDFJS) {
            console.error('Missing PDFJS.');
            return 0;
        }
        let pdf = this.PDFJS.getDocument(url);
        return pdf.promise.then((pdf) => {
            // get all pages text
            let maxPages = pdf.numPages;
            let countPromises = []; // collecting all page promises
            for (let j = 1; j <= maxPages; j++) {
                let page = pdf.getPage(j);

                // push an promise
                countPromises.push(
                    page.then((page) => {
                        let textContent = page.getTextContent();
                        return textContent.then((segment) => {
                            return {
                                page: j,
                                items: segment.items
                            };
                        });
                    })
                );
            }
            // Wait for all pages and join text
            return Promise.all(countPromises).then((segments) => {
                return segments;
            });
        });
    }
    
    static async getTitle(url) {
        let segment = await this.getSegment(url);
        let scales = [];
        let isAbstractShown = false;
        segment[0].items.forEach(el => {
            let transform = el.transform;
            if(scales.find(it => it.size === transform[0]) == undefined) {
                if(scales.length === 0 || transform[0] < scales[0].size || !isAbstractShown)
                    scales.push({
                        size: transform[0],
                        y: transform[5]
                    });
            }
            scales.sort((a, b) => b.size - a.size);
            if(el.str.indexOf('Abstract') > -1)
                isAbstractShown = true;
        });
        let candidate = [];
        segment[0].items.forEach(el => {
            let size = el.transform[0];
            let y = el.transform[5];
            let index = scales.indexOf(scales.find(it => it.size === size));
            if(y === scales[0].y && index > -1 && index < 5)
                if(candidate.indexOf(size) < 0)
                    candidate.push(size);
        })
        let title = [];
        segment[0].items.forEach(el => {
            let transform = el.transform;
            if (candidate.indexOf(transform[0]) > -1)
                title.push(el.str);
        });
        let result = title.join(' ');
        result = result.replace(/ +/g, ' ');
        if(result[0] == ' ') result = result.slice(1);
        if(result.slice(-1) == ' ') result = result.slice(0, -1);
        return result;
    }
}