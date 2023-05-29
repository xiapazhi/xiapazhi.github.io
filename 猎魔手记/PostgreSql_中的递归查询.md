递归查询特别适用于树形结构和图形结构等递归结构数据的查询。
项目中常见的需要递归查询的场景多为多层次的部门组织结构

### 递归查询的基本语法
在 PostgreSQL 中，递归查询使用 WITH RECURSIVE 子句来实现。该子句包括两个部分：初始查询和递归查询。
```sql
WITH RECURSIVE cte_name (column_list) AS (
  -- 初始查询
  SELECT column_list FROM table_name WHERE condition
  UNION ALL
  -- 递归查询
  SELECT column_list FROM table_name JOIN cte_name ON join_condition WHERE condition
)
SELECT column_list FROM cte_name;
```
- cte_name: 递归查询的名称，可以自定义，用于在查询中引用递归查询的结果集。
- column_list: 列名列表，表示查询结果中包含的列。
- table_name: 要查询的表名。
- condition: 查询条件，用于筛选符合条件的数据行。
- join_condition: 连接条件，用于连接递归查询结果集和表。
---
在递归查询中，初始查询用于获取初始数据，递归查询用于获取递归数据。递归查询使用 UNION ALL 操作符将递归查询结果与初始查询结果合并，并通过 JOIN 子句进行递归查询，直到查询结果为空。
递归查询使用了递归函数来实现，而递归函数的定义是递归查询的核心。

### 示例
下面是一个简单的递归查询示例，查询一个包含父子关系的部门表中各部门的直接下属和所有下属的数量：
```sql
WITH RECURSIVE subordinates AS (
  SELECT department_id, 1 AS level
  FROM departments
  WHERE parent_department_id IS NULL
  UNION ALL
  SELECT d.department_id, s.level + 1
  FROM departments d
  JOIN subordinates s ON d.parent_department_id = s.department_id
)
SELECT department_id, level, count(*) OVER () AS num_of_subordinates
FROM subordinates;
```
在这个示例中，我们定义了一个名为 subordinates 的递归查询，查询部门表中包含父子关系的部门的直接下属和所有下属的数量。初始查询部分查询了没有父部门的根部门，即顶级部门。递归查询部分使用了 JOIN 子句，将部门表和递归查询结果连接起来，查询每个部门的直接下属。递归查询使用了 `UNION ALL` 操作符将递归查询结果与初始查询结果合并，并通过 `JOIN` 子句进行递归查询，直到查询结果为空。

在查询结果中，我们使用 `count(*)` `OVER ()` 函数来查询每个部门的下属数量，并将其作为新的一列显示在结果中。此外，还用 level 列来表示部门的层级。

### 注意事项
在使用递归查询时，需要注意以下几点：

- 递归查询应该是有限的，否则可能导致死循环。
- 递归查询应该使用合适的索引，否则可能导致性能问题。
- 递归查询中的连接条件和查询条件应该合理，否则可能导致查询结果不准确。
- 此外，需要注意的是，在 PostgreSQL 中，递归查询使用了递归函数来实现，而递归函数的执行过程可能会导致较高的 CPU 和内存消耗。因此，在使用递归查询时，需要注意查询的数据量和查询效率，以避免影响系统的性能。
