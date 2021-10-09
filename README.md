<div align="center">
    <img src="./src/assets/logo.svg" width="60" style="width: 80px;"/>
    <p>IKFB</p>
    <p><img src="https://img.shields.io/github/v/release/Creator-SN/IKFB" /></p>
    <p><img src="https://img.shields.io/github/downloads/Creator-SN/IKFB/total?color=green&style=flat-square">
</div>

<p align="center">
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/license-GPL-blue?color=blue&style=flat-square">
    </a>
</p>

# IKFB

Involution King Fun Book (IKFB, Chinese: 卷王快乐本) is an integrated management system for papers and literature. Powered by Electron.

## File Structure

- Config
    * config.json

- Data Structure
    * root/
        * ikfb_files/
            * items[i]
                * *.pdf
                * *.ipcnb
        * data_structure.json

## Project setup

```
npm install
```

or

```
yarn
```

### Compiles and hot-reloads for development

```
npm run electron:serve
```

```
yarn electron:serve
```

### Compiles and minifies for production
```
npm run build
```

or

```
yarn build
```

### Lints and fixes files
```
npm run lint
```

or

```
yarn lint
```

## Doc

### Data Structure

**Init Function**

1. load_ds_file

    ```javascript
    load_ds_file(data_path=[])
    => {
        status,
        db_array: [{
            status,
            db
        }]
    }
    ```
    - status: 
        - `200`: success.
        - `404`: data_path is empty.
        - `500`: source url not found.
        - `502`: data_structure.json not found.
    - db_array: A array of each source object, each object contains the current ds' db and status.
    - db: A data_structure's lowdb DataStore.

2. init_ds

    ```javascript
    init_ds(id, name, ds_db)
    => default
    ```

## License

GPL 3 License

Copyright (c) 2021 Creator SN®