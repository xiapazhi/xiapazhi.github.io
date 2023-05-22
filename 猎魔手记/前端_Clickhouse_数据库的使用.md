## [ClickHouse](https://clickhouse.com/) 数据库

ClickHouse是一个用于联机分析(OLAP)的列式数据库管理系统(DBMS)。

## 特性

- 真正的列式数据库管理系统
- 数据压缩
- 多核心并行处理
- 多服务器分布式处理
- 支持SQL
- 实时的数据更新
- 支持近似计算
- ...

## 在 nodejs 中使用

基于 clickhouse 工具包

1、在 api\config.js 的 product -> mws -> {entry: require('./app').entry} -> opts 中配置 clickhouse 链接信息（url， port）

```js
entry: require('./app').entry,
         opts: {
            dev,
						...
            clickHouse: {
			   // 地址与端口
               url: CLICKHOUST_URL,
               port: CLICKHOUST_PORT,
			   // 用户名、密码
               user: CLICKHOUST_USER,
               password: CLICKHOUST_PASSWORD,
               db: [
                  {
				     // 在系统中使用的 clickhouse 实例名称
                     name: 'anxinyun',
					 // clickhouse 中真正的数据库名称
                     db: CLICKHOUST_ANXINCLOUD
                  }, 
               ]
            }
         }
```

2、配置 clickhouse 实例化文件，遍历所有的 clickhouse 数据库信息，并存在架构的全局变量 app 中

```js
'use strict';
const { ClickHouse } = require('clickhouse');

function factory (app, opts) {
   if (opts.clickHouse) {
      try {
         app.fs.clickHouse = {}
         const { url, port, user, password, db = [] } = opts.clickHouse
         for (let d of db) {
            if (d.name && d.db) {
		       // 实例化 clickhouse 数据库
			   // 并存在 app.fs 变量中以便接口调用
               app.fs.clickHouse[d.name] = new ClickHouse({
                  url: url,
                  port: port,
                  debug: opts.dev,
                  format: "json",
                  basicAuth: user && password ? {
                     username: user,
                     password: password,
                  } : null,
				  // 指定要链接的数据库名称
                  config: {
                     database: d.db,
                  },
               })
               console.info(`ClickHouse ${d.name} 初始化完成`);
            } else {
               throw 'opts.clickHouse 参数错误！'
            }
         }
      } catch (error) {
         console.error(error)
         process.exit(-1);
      }
   }
}

module.exports = factory;
```

3、在接口中使用

```js
async function detail (ctx) {
   try {
      const { models } = ctx.fs.dc;
      const { clickHouse } = ctx.app.fs
      const { alarmId } = ctx.query
	  // 查库
      const detailRes = await clickHouse.dataAlarm.query(`
         SELECT * FROM alarm_details WHERE AlarmId = '${alarmId}' ORDER BY Time ASC
      `).toPromise()

      ctx.status = 200;
      ctx.body = detailRes
   } catch (error) {
      ctx.fs.logger.error(`path: ${ctx.path}, error: error`);
      ctx.status = 400;
      ctx.body = {
         message: typeof error == 'string' ? error : undefined
      }
   }
}
```