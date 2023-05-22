# 从excel数据表尽快创建相同数据库表、导入数据、辅助web相应列表开发

> 2022-07-30 15:19:22

## 背景：

四好公路 v1.0.0 所有原始数据均需从 excel 表格导入数据库，用以展示、编辑、统计

## 思路：
通过程序拼接生成 sql 脚本，将 excel 数据表的中文字段与数据库所需的英文字段一一对应，以 json 格式输出至文件中，方便 web 遍历以生成 form 表单、table 表格；

## sql 及 字段生成对应
```js
try {
    const { Pool, Client } = require('pg')
    const request = require('superagent');
    const Hex = require('crypto-js/enc-hex');
    const MD5 = require('crypto-js/md5');
    const XLSX = require('xlsx')
    const path = require('path')
    const fs = require("fs");

    // 连接数据库
    const pool = new Pool({
        user: 'postgres',
        host: '10.8.30.32',
        database: '',
        password: '',
        port: 5432,
    })

    let appid = 'xxxxx';
    let key = 'yyyyy';
    const getAnswer = async (query) => {
        let start = (new Date()).getTime();
        let salt = start;
        let str1 = appid + query + salt + key;
        let sign = Hex.stringify(MD5(str1));
        console.log(`翻译：${query}`);
        let answer = await request.get('http://api.fanyi.baidu.com/api/trans/vip/translate').timeout(1000 * 30).query({
            q: query,
            appid: appid,
            salt: salt,
            from: 'zh',
            to: 'en',
            sign: sign
        });
        if (answer.body.error_code) {
            console.warn(answer.body);
            throw '百度不给力，快快debug'
        }
        let rslt = answer.body.trans_result;
        // let upperCaseRslt = rslt[0].dst.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()).replace(/ /g, '');
        // let upperCaseRslt = rslt[0].dst.toUpperCase().replace(/ /g, '_');
        // let upperCaseRslt = rslt[0].dst.toLowerCase().replace(/ /g, '_');
        let upperCaseRslt = rslt[0].dst
            .replace(/\//g, ' ')
            .replace(/'/g, '')
            .replace(/:/g, '')
            .trim()
            .replace(/\s{2,}/g, '')
            .replace(/-/g, ' ');
        console.log(`翻译结果：${upperCaseRslt}`);
        while (((new Date()).getTime() - start) < (1000 / 8)) {//每s只能调用10次
            continue;
        }
        return upperCaseRslt
    }

    const fun = async () => {
        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // 有手动更改 不要轻易再次执行脚本
            const fileList = [
                // {
                //     path: './data/道路/县道第三方.xls',
                //     n: '道路',
                //     tableName: 'road'
            ]

            for (let f of fileList) {
                console.log(`读取 ${f.path}`);
                // 读取数据文件
                let workbook = XLSX.readFile(path.join(__dirname, f.path))
                let firstSheetName = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[firstSheetName];
                let res = XLSX.utils.sheet_to_json(worksheet, {
                    defval: ''
                });
                console.log(res[0]);
                let dataEx = res[0];
                transResult = ''
                sqlResult = ''
                transResolveResult = ''
                sql = ` 
                    -- ${f.n}
                    create table if not exists "${f.tableName}"
                    (
                        id serial not null
                    );

                    create unique index if not exists ${f.tableName}_id_uindex
                        on ${f.tableName} (id);

                    alter table ${f.tableName}
                        add constraint ${f.tableName}_pk
                            primary key (id);
                `
                let upperEngTArr = []
                for (let t in dataEx) {
                    const engT = await getAnswer(t);
                    let upperEngT = engT
                        .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
                        .replace(/ /g, '_')

                    transResult += `"${t}" : "${upperEngT
                        .replace(/_/g, '')
                        .replace(/( |^)[A-Z]/g, (L) => L.toLowerCase())
                        }", \n
                    `
                    sqlResult += `"${t}" : "${engT.trim().replace(/ /g, '_').replace(/( |^)[A-Z]/g, (L) => L.toLowerCase())}", \n
                    `
                    // transResolveResult += ` "${upperEngT
                    //     .replace(/_/g, '')
                    //     .replace(/( |^)[A-Z]/g, (L) => L.toLowerCase())
                    //     }":{
                    //         "type": "string",
                    //         "description": "${t}"
                    //     },\n
                    // `
                    transResolveResult += ` "${upperEngT
                        .replace(/_/g, '')
                        .replace(/( |^)[A-Z]/g, (L) => L.toLowerCase())
                        }":"${t}",\n
                    `
                    sql += `
                        alter table ${f.tableName} add ${upperEngT} varchar(1024);
                        comment on column ${f.tableName}.${upperEngT} is '${t}';
                    `
                }
                fs.writeFileSync(`${f.n}_字段对应.json`, `{${transResult}}`, 'utf-8');
                fs.writeFileSync(`${f.n}_数据脚本对应.sql`, sql, 'utf-8');
                fs.writeFileSync(`${f.n}_数据库表对应.json`, `{${sqlResult}}`, 'utf-8');
                fs.writeFileSync(`${f.n}_数据字段对应.json`, `{${transResolveResult}}`, 'utf-8');
            }

            // await client.query('ROLLBACK')
            await client.query('COMMIT')
            console.log('执行完毕~')
        } catch (e) {
            await client.query('ROLLBACK')
            console.log('执行错误~')
            throw e
        } finally {
            client.release();
        }
    }

    fun()
} catch (error) {
    console.error(error)
}
```

## 数据录入
```js
try {
    const { Pool, Client } = require('pg')
    const request = require('superagent');
    const Hex = require('crypto-js/enc-hex');
    const MD5 = require('crypto-js/md5');
    const XLSX = require('xlsx')
    const path = require('path')
    const fs = require("fs");
    const moment = require('moment');

    // 连接数据库
    const pool = new Pool({
        user: 'postgres',
        host: '10.8.30.32',
        database: '',
        password: '',
        port: 5432,
    })

    const fun = async () => {
        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const fileList = [
                // {
                //     path: ['./data/道路/村道第三方.xls'],
                //     n: '道路',
                //     tableName: 'road',
                //     defaultKey: ['level'],
                //     defaultValue: ['村'],
                // },
            ]

            for (let f of fileList) {
                console.log(f.path);
                // 读取数据文件
                for (let p of f.path) {
                    console.log(`读取 ${p}`);
                    let workbook = XLSX.readFile(path.join(__dirname, p))
                    let firstSheetName = workbook.SheetNames[0];
                    let worksheet = workbook.Sheets[firstSheetName];
                    let res = XLSX.utils.sheet_to_json(worksheet);
                    const keyMap = require(`./${f.n}_数据库表对应.json`);
                    console.log(keyMap);
                    for (let d of res) {
                        let insertStr = `INSERT INTO "${f.tableName}" (`;
                        let insertKeys = (f.defaultKey || []).concat([]);
                        let insertValues = (f.defaultValue || []).concat([]);
                        for (let k in keyMap) {
                            // 没做判重
                            let v = d[k];
                            if (v) {
                                insertKeys.push(keyMap[k]);

                                if (f.n == '工程一览') {
                                    if (k == '项目进展情况' && v == '已完工') {
                                        insertValues[0] = true
                                    }
                                }

                                insertValues.push(v);
                            }
                        }
                        insertStr += insertKeys.join(',') + ') VALUES (';
                        insertStr += insertKeys.map((k, i) => `$${i + 1}`).join(',') + ')';
                        // console.log(insertStr, insertValues);
                        console.log(`插入 ${insertValues}`);
                        await client.query(insertStr, insertValues);
                        // break;
                    }
                    // break;
                }
            }

            // await client.query('ROLLBACK')
            await client.query('COMMIT')
            console.log('执行完毕~')
        } catch (e) {
            await client.query('ROLLBACK')
            console.log('执行错误~')
            throw e
        } finally {
            client.release();
        }
    }

    fun()
} catch (error) {
    console.error(error)
}
```

通过执行以上脚本，可大幅减少开发时间；