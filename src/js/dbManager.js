import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

import fs from 'fs-extra'
import path from 'path'
import { app, remote } from 'electron' // 引入remote模块

import { config } from './data_sample'

const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块
const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

console.log(STORE_PATH)

export class ConfigDB {
    constructor() {
        ConfigDB.initConfigDBFile();
        this.config_adapter = new FileSync(path.join(STORE_PATH, '/config.json'));
        this.config_db = Datastore(this.config_adapter);
        this.initConfigDB();
    }


    /**
     * 初始化配置数据库文件
     *
     * @static
     * @memberof ConfigDB
     */
    static initConfigDBFile() {
        if (process.type !== 'renderer') {
            if (!fs.pathExistsSync(STORE_PATH)) { // 如果不存在路径
                fs.mkdirpSync(STORE_PATH) // 就创建
            }
        }
    }


    /**
     * 初始化配置数据库内容
     *
     * @static
     * @memberof ConfigDB
     */
    initConfigDB() {
        if (!this.config_db.has('init_status').value()) { // 先判断该值存不存在
            this.config_db.defaults(config)
                .write()
        }
    }
}

export class DataDB {
    constructor (pathList) {
        let response = DataDB.initDataDB(pathList);
        this.dbXList = response.dbXList;
        this.dbList = [];
        for(let i = 0; i < this.dbXList.length; i++) {
            this.dbList.push(this.dbXList[i].db);
        }
        this.status = response.status;
    }
    

    /**
     * 初始化数据源数据库
     *
     * @static
     * @param {*} [data_path=[]]
     * @returns
     * @memberof DataDB
     */
    static initDataDB(data_path = []) {
        let dbXList = [];
        if (data_path.length == 0)
            return {
                status: 404,
                msg: 'data_path is empty.',
                dbXList: dbXList
            };
        for (let url of data_path) {
            let ds_adapter = new FileSync(path.join(url, '/data_structure.json')) // 初始化lowdb读写的json文件名以及存储路径
            let ds_db = null;
            if (!fs.pathExistsSync(url)) { // 如果不存在路径
                dbXList.push({
                    status: 500,
                    msg: 'source url not found.',
                    db: null
                });
            }
            else {
                ds_db = Datastore(ds_adapter);
                if (!ds_db.has('id').value()) { // 先判断该值存不存在
                    dbXList.push({
                        status: 502,
                        msg: 'data_structure.json not found.',
                        db: ds_db
                    });
                }
                else {
                    dbXList.push({
                        status: 200,
                        msg: 'success.',
                        db: ds_db
                    });
                    fs.ensureDir(path.join(url, 'root'));
                }
            }
        }
        return {
            status: 200,
            msg: 'success.',
            dbXList: dbXList
        };
    }
}