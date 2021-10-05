
/**
 * 分组
 *
 * @export
 * @class group
 */
export declare class group {
    id: string
    name: string
    emoji: string
    groups: [group]
    partitions: [partition]
    createDate: string
}


/**
 * 分区
 *
 * @export
 * @class partition
 */
export declare class partition {
    id: string
    name: string
    emoji: string
    items: [string] // only item id
    createDate: string
}



/**
 * 项目是一个基本单元, 由pdf文件, 元数据, 笔记和标签组成
 *
 * @export
 * @class item
 */
export declare class item {
    id: string
    name: string
    emoji: string
    pdf: string
    metadata: metadata
    pages: [page]
    labels: [string]
    createDate: string
    updateDate: string
}


/**
 * 笔记
 *
 * @export
 * @class page
 */
export declare class page {
    id: string
    name: string
    emoji: string
    createDate: string
    updateDate: string
}


/**
 * 元数据
 *
 * @export
 * @class metadata
 */
export declare class metadata {
    publisher: string
    DOI: string
    createDate: string
    source: string
    title: string
    url: string
    containerTitle: string //一般是会议名称
    abstract: string
    ISSN: string
    language: string
    authors: [author]
}


/**
 * 作者信息
 *
 * @export
 * @class author
 */
export declare class author {
    first: string
    last: string
    sequence: string
}


/**
 * 数据结构
 *
 * @export
 * @class data_structure
 */
export declare class data_structure {
    id: string
    name: string
    groups: [group]
    partitions: [partition]
    items: [item]   //扁平化存储 FLAT, all items is placed in here
    templates: [page]
    path: string
    createDate: string
}


/**
 * 系统配置
 *
 * @export
 * @class config
 */
export declare class config {
    init_status: boolean
    data_path: [string]
    data_index: number
    language: language
    theme: theme
}

export type language = "en" | "zh"
export type theme = "light" | "dark"