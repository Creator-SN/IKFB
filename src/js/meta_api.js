import { metadata, author } from "@/js/data_sample.js";

export class META_API {

    static async cref_getInfoByTitle(title, axios) {
        let baseUrl = "https://api.crossref.org/works";
        title = title.replace(/ +/g, "+");
        try {
            return await new Promise((resolve) => {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                "query.bibliographic": title,
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatCref(response.data.message.items));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            });
        } catch (e) {
            return [];
        }
    }

    static formatCref(data) {
        let result = [];
        data.forEach((it) => {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            _metadata.title = it.title[0];
            _metadata.DOI = it.DOI;
            _metadata.abstract = it.abstract;
            _metadata.ISSN = it.ISSN ? it.ISSN[0] : "";
            _metadata.containerTitle = it["container-title"]
                ? it["container-title"][0]
                : "";
            _metadata.createDate = it.created
                ? it.created["date-time"]
                : "";
            _metadata.language = it.language;
            _metadata.publisher = it.publisher;
            _metadata.source = it.source;
            _metadata.url = it.URL;
            if (it.author) {
                it.author.forEach((el) => {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = el.first;
                    _author.last = el.last;
                    _author.sequence = el.sequence;
                    authors.push(_author);
                });
            }
            _metadata.authors = authors;
            if (_metadata.createDate != "")
                _metadata.year = new Date(_metadata.createDate).getFullYear().toString();
            result.push(_metadata);
        });

        return result;
    }

    static async semanticScholar_getInfoByTitle(title, axios) {
        let baseUrl =
            "https://api.semanticscholar.org/graph/v1/paper/search";
        title = title.replace(/ +/g, "+");
        try {
            return await new Promise((resolve) => {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                query: title,
                                fields: "url,title,abstract,authors,year,venue,fieldsOfStudy",
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatSemanticScholar(response.data.data));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            });
        } catch (e) {
            return [];
        }
    }

    static formatSemanticScholar(data) {
        let result = [];
        data.forEach((it) => {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            _metadata.title = it.title;
            _metadata.abstract = it.abstract;
            _metadata.year = it.year.toString();
            _metadata.publisher = it.venue;
            _metadata.url = it.url;
            it.authors.forEach((el) => {
                let _author = JSON.parse(JSON.stringify(author));
                let name = el['name'].split(" ");
                _author.first = name[0];
                if (name.length > 1)
                    _author.last = name[1];
                if (name.length > 2) {
                    _author.last = name[2];
                    _author.sequence = name[1];
                }
                authors.push(_author);
            });
            _metadata.authors = authors;
            result.push(_metadata);
        });

        return result;
    }
}