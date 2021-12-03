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