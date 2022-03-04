export const config = {
    init_status: true,
    data_path: [],
    data_index: -1,
    language: "en",
    theme: "light"
}


export const data_structure = {
    id: null,
    name: null,
    groups: [],
    partitions: [],
    items: [],
    templates: [],
    path: null,
    createDate: null
}

export const group = {
    id: null,
    name: null,
    emoji: null,
    groups: [],
    partitions: [],
    createDate: null
}
export const partition = {
    id: null,
    name: null,
    emoji: null,
    items: [], // only item id
    createDate: null
}

export const item = {
    id: null,
    name: null,
    emoji: null,
    pdf: null,
    metadata: null,
    pages: [],
    labels: [],
    createDate: null,
    updateDate: null
}

export const page = {
    id: null,
    name: null,
    emoji: null,
    createDate: null,
    updateDate: null
}

export const metadata = {
    publisher: null,
    DOI: null,
    year: null,
    createDate: null,
    source: null,
    title: null,
    url: null,
    containerTitle: null, //一般是会议名称
    abstract: null,
    ISSN: null,
    language: null,
    chapter: null,
    pages: null,
    school: null,
    note: null,
    authors: []
}

export const author = {
    first: null,
    last: null,
    sequence: null
}