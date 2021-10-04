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

export const page = {
    id: null,
    name: null,
    emoji: null,
    createDate: null,
    updateDate: null
}