import Datastore from 'lowdb'
import { config, data_structure } from './data_sample'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import fs from 'fs-extra'
import { app, remote } from 'electron' // 引入remote模块

const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块

const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

const config_adapter = new FileSync(path.join(STORE_PATH, '/config.json')) // 初始化lowdb读写的json文件名以及存储路径

const config_db = Datastore(config_adapter) // lowdb接管该文件

load_config_file();
init_config();

export default {
    config_db,
    load_ds_file,
    init_ds
} // 暴露出去


console.log(STORE_PATH)

/**
 * 初始化配置数据库文件
 *
 */
function load_config_file() {
    if (process.type !== 'renderer') {
        if (!fs.pathExistsSync(STORE_PATH)) { // 如果不存在路径
            fs.mkdirpSync(STORE_PATH) // 就创建
        }
    }
}


/**
 * 初始化配置数据库内容
 *
 */
function init_config() {
    if (!config_db.has('init_status').value()) { // 先判断该值存不存在
        config_db.defaults(config)
            .write()
    }
}

/**
 * 初始化源数据数据库文件
 *
 */
function load_ds_file(data_path = []) {
    let db_array = [];
    if (data_path.length == 0)
        return {
            status: 404,
            msg: 'data_path is empty.',
            db_array: db_array
        };
    for (let url of data_path) {
        let ds_adapter = new FileSync(path.join(url, '/data_structure.json')) // 初始化lowdb读写的json文件名以及存储路径
        let ds_db = null;
        if (!fs.pathExistsSync(url)) { // 如果不存在路径
            db_array.push({
                status: 500,
                msg: 'source url not found.',
                db: null
            });
        }
        else {
            ds_db = Datastore(ds_adapter);
            if (!ds_db.has('id').value()) { // 先判断该值存不存在
                db_array.push({
                    status: 502,
                    msg: 'data_structure.json not found.',
                    db: ds_db
                });
            }
            else
                db_array.push({
                    status: 200,
                    msg: 'success.',
                    db: ds_db
                });
        }
    }
    return {
        status: 200,
        msg: 'success.',
        db_array: db_array
    };
}


/**
 * 初始化源数据数据库内容
 *
 */
function init_ds(id, name, ds_db) {
    let ds = data_structure;
    ds.id = id;
    ds.name = name;
    ds.createDate = this.$SDate.DateToString(new Date());
    if (!ds_db.has(id).value()) { // 先判断该值存不存在
        ds_db.defaults(ds)
            .write()
    }
}