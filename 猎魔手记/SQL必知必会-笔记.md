# [SQL 必知必会 [ 陈旸 ]](https://time.geekbang.org/column/intro/100029501?tab=catalog)

>记得带着一点点从大学课程中学到的C++基础初入前端时，带我入门的老师傅对我说：“无论什么时候，数据总要存起来，存起来的数据也总要给人看，所以学好SQL和前端，总不至于吃不上饭”。好几年过去了，前端技能经验值蹭蹭涨，SQL 还停留在  `SELECT * FROM T` 的阶段，尤其是学会了使用 sequelize，然而 sequelize 的运用也没有脱离简单的 SELECT，稍微复杂的业务也总是把数据全查出来，用 JS 去筛选；所以希望借着这次机会，能系统的学习一下 SSSQL;

[思维导图](https://github.com/cystanford/SQL-XMind)

---

测试数据

[HERO 数据](https://github.com/cystanford/sql_heros_data)

[NBA 数据](https://github.com/cystanford/sql_nba_data)

---

由于 SQL 一直称霸 DBMS (DataBase Management System)，因此许多人在思考是否有一种数据库技术能远离 SQL，于是 NoSQL 诞生了，但是随着发展却发现越来越离不开 SQL。  
到目前为止 NoSQL 阵营中的 DBMS 都会有实现类似 SQL 的功能。下面是“NoSQL”这个名词在不同时期的诠释，从这些释义的变化中可以看出 NoSQL 功能的演变： 

1970：NoSQL = We have no SQL  
1980：NoSQL = Know SQL  
2000：NoSQL = No SQL!  
2005：NoSQL = Not only SQL  
2013：NoSQL = No, SQL!  

NoSQL 对 SQL 做出了很好的补充，它可以让我们在云计算时代，更好地使用数据库技术，比如快速读写，这样可以用低廉的成本，更方便进行扩展。

需要注意的是，虽然我们有时候把 Oracle、MySQL 等称之为数据库，但确切讲，它们应该是数据库管理系统，即 DBMS。

---

简单梳理 DBMS 的发展：  
1974 年，IBM 研究员发布了一篇揭开数据库技术的论文《SEQUEL：一门结构化的英语查询语言》，  
1979 年，第一个商用关系型数据库 Oracle 2 诞生，  
1992 年，SQL92 标准，  
1995 年，MySQL 开源数据库诞生，  
1999 年，SQL99 标准，  
如今，NoSQL 得到了发展，并且围绕 SQL 标准展开的 DBMS 竞赛从来没有停止过。  
在这段发展史中，既有 SQL 阵营，又有 NoSQL 阵营，既有商业数据库软件，又有开源产品，在不同的应用场景下，同一家公司也会有不同的 DBMS 布局。

## SQL 是如何执行的

### 在 Oracle 中

执行过程

![](https://static001.geekbang.org/resource/image/4b/70/4b43aeaf9bb0fe2d576757d3fef50070.png)

1. 语法检查：检查 SQL 拼写是否正确，如果不正确，Oracle 会报语法错误。
2. 语义检查：检查 SQL 中的访问对象是否存在。比如我们在写 SELECT 语句的时候，列名写错了，系统就会提示错误。  
   语法检查和语义检查的作用是保证 SQL 语句没有错误。
3. 权限检查：看用户是否具备访问该数据的权限。
4. 共享池检查：共享池（Shared Pool）是一块内存池，最主要的作用是缓存 SQL 语句和该语句的执行计划。  
   Oracle 通过检查共享池是否存在 SQL 语句的执行计划，来判断进行软解析，还是硬解析。  
   - 软解析：在共享池中，Oracle 首先对 SQL 语句进行 Hash 运算，然后根据 Hash 值在库缓存（Library Cache）中查找，如果存在 SQL 语句的执行计划，就直接拿来执行，直接进入“执行器”的环节；
   - 硬解析：如果没有找到 SQL 语句和执行计划，Oracle 就需要创建解析树进行解析，生成执行计划，进入“优化器”这个步骤；
   - 优化器：优化器中就是要进行硬解析，也就是决定怎么做，比如创建解析树，生成执行计划。执行器：当有了解析树和执行计划之后，就知道了 SQL 该怎么被执行，这样就可以在执行器中执行语句了。
   - 共享池：是 Oracle 中的术语，包括了库缓存，数据字典缓冲区等。
     - 库缓存区，它主要缓存 SQL 语句和执行计划。
     - 数据字典缓冲区：存储的是 Oracle 中的对象定义，比如表、视图、索引等对象。当对 SQL 语句进行解析的时候，如果需要相关的数据，会从数据字典缓冲区中提取。

- 可以通过绑定变量避免硬解析：
  
  例如
    ```sql
    select * from player where player_id = 10001;
    ```
  改为
    ```sql
    select * from player where player_id = :player_id;
    ```

  绑定变量会带来优化困难的缺陷；

### 在 MySQL 中

MySQL 是典型的 C/S 架构，即 Client/Server 架构，服务器端程序使用 mysqld。

1. 流程图：

    ![](https://static001.geekbang.org/resource/image/c4/9e/c4b24ef2377e0d233af69925b0d7139e.png)

   - 连接层：客户端和服务器端建立连接，客户端发送 SQL 至服务器端；
   - SQL 层：对 SQL 语句进行查询处理；
   - 存储引擎层：与数据库文件打交道，负责数据的存储和读取。

2. SQL 层的结构

    ![](https://static001.geekbang.org/resource/image/30/79/30819813cc9d53714c08527e282ede79.jpg)

   - 查询缓存：Server 如果在查询缓存中发现了这条 SQL 语句，就会直接将结果返回给客户端；如果没有，就进入到解析器阶段。需要说明的是，因为查询缓存往往效率不高，一旦数据表有更新，缓存都将清空，因此只有数据表是静态的时候，或者数据表很少发生变化时，使用缓存查询才有价值，否则如果数据表经常更新，反而增加了 SQL 的查询时间。所以在 MySQL8.0 之后就抛弃了这个功能。
   - 解析器：在解析器中对 SQL 语句进行语法分析、语义分析。
   - 优化器：在优化器中会确定 SQL 语句的执行路径，比如是根据全表检索，还是根据索引来检索等。
   - 执行器：在执行之前需要判断该用户是否具备权限，如果具备权限就执行 SQL 查询并返回结果。在 MySQL8.0 以下的版本，如果设置了查询缓存，这时会将查询结果进行缓存。

3. 常见的存储引擎

    与 Oracle 不同的是，MySQL 的存储引擎采用了插件的形式，每个存储引擎都面向一种特定的数据库应用环境。同时开源的 MySQL 还允许开发人员设置自己的存储引擎，下面是一些常见的存储引擎：

    - InnoDB 存储引擎：它是 MySQL 5.5 版本之后默认的存储引擎，最大的特点是支持事务、行级锁定、外键约束等。
    - MyISAM 存储引擎：在 MySQL 5.5 版本之前是默认的存储引擎，不支持事务，也不支持外键，最大的特点是速度快，占用资源少。
    - Memory 存储引擎：使用系统内存作为存储介质，以便得到更快的响应速度。不过如果 mysqld 进程崩溃，则会导致所有的数据丢失，因此我们只有当数据是临时的情况下才使用 Memory 存储引擎。
    - NDB 存储引擎：也叫做 NDB Cluster 存储引擎，主要用于 MySQL Cluster 分布式集群环境，类似于 Oracle 的 RAC 集群。
    - Archive 存储引擎：它有很好的压缩机制，用于文件归档，在请求写入时会进行压缩，所以也经常用来做仓库。

    需要注意的是，数据库的设计在于表的设计，而在 MySQL 中每个表的设计都可以采用不同的存储引擎，我们可以根据实际的数据处理需要来选择存储引擎，这也是 MySQL 的强大之处。

### 使用 profiling 分析 SQL 语句在 mysql 中的执行时间

1. 查看 profiling 状态
   ```sql
   select @@profiling;
   ```
   profiling=0 代表关闭，1代表打开；

2. 打开 profiling，设置为 1
    ```sql
    set profiling=1;
    ```
3. 查看当前会话所产生的所有 profiles
    在执行任意一个 SQL 查询后

    如
    ```sql
    select * from wucai.heros;
    ```
    查询 profiles
    ```sql
    show profiles;
    ```
    得到
    ![](/_media/猎魔笔记/SQL必知必会/profilesRslt.webp)

    3.1 获取上一次查询的执行时间
     
      ```sql
      show profile;
      -- 或以 id 查询
      show profile for query 2;
      ```
      ![](/_media/猎魔笔记/SQL必知必会/profile.png)


### 总结

![](https://static001.geekbang.org/resource/image/02/f1/02719a80d54a174dec8672d1f87295f1.jpg)

## 使用DDL创建数据库

DDL 的英文全称是 Data Definition Language，即数据定义语言。它定义了数据库的结构和数据表的结构。

DDL 是 DBMS 的核心组件，也是 SQL 的重要组成部分，DDL 的正确性和稳定性是整个 SQL 运行的重要基础。

在 DDL 中，我们常用的功能是增删改，分别对应的命令是 CREATE、DROP 和 ALTER。需要注意的是，在执行 DDL 的时候，不需要 COMMIT （COMMIT 用以提交事务等），就可以完成执行任务。

### - 定义数据库

```sql
CREATE DATABASE nba; // 创建一个名为nba的数据库
DROP DATABASE nba; // 删除一个名为nba的数据库
```

### - 定义数据表

```sql
CREATE TABLE [table_name](字段名 数据类型，......)

例如

DROP TABLE IF EXISTS `player`;

CREATE TABLE `player`  (
  `player_id` int(4) NOT NULL AUTO_INCREMENT,
  `player_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`player_id`) USING BTREE, 
  UNIQUE INDEX `player_name`(`player_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;
```

数据表和字段使用反引号，以避免它们的名称与 MySQL 保留字段相同；

其中 player_name ：

字段的字符编码是 utf8，  
排序规则是utf8_general_ci，代表对大小写不敏感，  
如果设置为utf8_bin，代表对大小写敏感，  
还有许多其他排序规则~

使用 UNIQUE INDEX 设置唯一索引，唯一索引和普通索引（NORMAL INDEX）的区别在于它对字段进行了唯一性的约束

player_id 使用 使用PRIMARY KEY 设置主键，同时索引方法采用 BTREE。

### - 修改表结构

#### - 添加字符

```sql
ALTER TABLE player ADD age int(11);
```

#### - 修改字段名

```sql
 ALTER TABLE player CHANGE age player_age int(11);
```

#### - 修改字段的数据类型

```sql
ALTER TABLE player MODIFY column player_age float(3,1)
```

#### - 删除字段

```sql
ALTER TABLE player DROP COLUMN player_age;
```

### 数据表常见约束

- 主键约束：
  主键起的作用是唯一标识一条记录，不能重复，不能为空，即 UNIQUE + NOT NULL 。  
  一个数据表的主键只能有一个。  
  主键可以是一个字段，也可以由多个字段复合组成（即联合主键，通过多个字段确定唯一性）。

- 外键约束：
  外键确保了表与表之间引用的完整性。  
  一个表中的外键对应另一张表的主键。  
  外键可以重复，也可以为空。

- 唯一性约束
- NOT NULL 约束
- DEFAULT 约束
- CHECK 约束   
  MySQL 8.0.16 以后版本生效。数据库层字段校验；  
  例如
  比如我们可以对身高 height 的数值进行 CHECK 约束
  ```sql
  ALTER TABLE player ADD height int(4) CHECK(height>0 AND height<300)
  ```

## 数据表的设计原则

原则就是简单可复用

1. 表的个数越少越好  
   RDBMS 的核心在于对实体和联系的定义，数据表越少，证明实体和联系设计得越简洁，既方便理解又方便操作。  
   实体抽象表现为现实中的一个对象，也不能刻意追求表少，合并不相关的属性；

2. 数据表中的字段个数越少越好  
   字段个数越多，数据冗余的可能性越大。  
   所以可以减少可计算得到的字段存储；

3. 数据表中联合主键的字段个数越少越好  
   联合主键中的字段越多，占用的索引空间越大，不仅会加大理解难度，还会增加运行时间和索引空间；

4. 使用主键和外键越多越好 （颇有争议）  
   数据库的设计实际上就是定义各种表，以及各种字段之间的关系。这些关系越多，证明这些实体之间的冗余度越低，利用度越高。这样做的好处在于不仅保证了数据表之间的独立性，还能提升相互之间的关联使用率。  
    外键的使用，在数据库层面保证了数据的完整于一至性，同时增加资源开销；

### 阶段总结

![](https://static001.geekbang.org/resource/image/80/c1/80aecedfad59aad06cc08bb9bca721c1.jpg)    
   
## 数据检索 SELECT

### 基础语法

- 查询列
  ```sql
  SELECT column_name, column_name2 FROM table_name
  ```
  查所有列
  ```sql
  SELECT * FROM table_name
  ```
- 起别名
  ```sql
  SELECT column_name AS n FROM table_name
  ```

- 常数
  ```sql
  SELECT '王者荣耀' as column_name, name FROM table_name
  ```

- 去重 DISTINCT
  ```sql
  SELECT DISTINCT column_name FROM table_name
  ```
  需注意：
  - DISTINCT 需要放到所有列名的前面
  - DISTINCT 其实是对后面所有列名的组合进行去重
  
- 排序 ORDER BY
  ```sql
  SELECT * FROM table_name ORDER BY column_name DESC
  ```
  需注意：
  - ORDER BY 后面可以有一个或多个列名，如果是多个列名进行排序，会按照后面第一个列先进行排序，当第一列的值相同的时候，再按照第二列进行排序，以此类推。
  - ORDER BY 后面可以注明排序规则，ASC 代表递增排序（默认值），DESC 代表递减排序。
  - 非选择列排序：ORDER BY 可以使用非选择列进行排序，所以即使在 SELECT 后面没有这个列名，你同样可以放到 ORDER BY 后面进行排序。

- 约束数量 LIMIT
  - MySQL、PostgreSQL、MariaDB 和 SQLite ： LIMIT
    ```sql
    SELECT * FROM table_name LIMIT 7
    ```
  - SQL Server 和 Access ：TOP
    ```sql
    SELECT TOP 7 * FROM table_name
    ```
  - DB2 ：FETCH FIRST 7 ROWS ONLY
    ```sql
    SELECT * FROM table_name FETCH FIRST 5 ROWS ONLY
    ```
  - Oracle ：ROWNUM
    ```sql
    SELECT * FROM table_name WHERE ROWNUM <=5
    ```
  约束返回结果的数量可以减少数据表的网络传输量，提升查询效率

### SELECT 的关键字顺序

语法顺序，不能颠倒
```sql
SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ...
```

### SELECT 语句的执行顺序

```sql

FROM > WHERE > GROUP BY > HAVING > SELECT 的字段 > DISTINCT > ORDER BY > LIMIT
```

例

```sql

SELECT DISTINCT count(*) as num                                                     #顺序5
FROM table_name JOIN table_name2 ON table_name.id = table_name2.table_name_id       #顺序1
WHERE column_name > 1.80                                                            #顺序2
GROUP BY table_name.id                                                              #顺序3
HAVING num > 2                                                                      #顺序4
ORDER BY num DESC                                                                   #顺序6
LIMIT 7                                                                             #顺序7
```

在 SELECT 语句执行这些步骤的时候，每个步骤都会产生一个虚拟表，然后将这个虚拟表传入下一个步骤中作为输入

### 阶段总结

![](https://static001.geekbang.org/resource/image/c8/a8/c88258e72728957b43dc2441d3f381a8.jpg)