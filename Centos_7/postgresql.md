# Postgresql

[官网直达](https://www.postgresql.org/download/linux/redhat/)

以 v10 为例实践

按官网方法安装完成之后

## 设置允许远程访问

- 修改 /var/lib/pgsql/10/data 下的 pg_hba.conf

  在 # IPv4 local connections: 下添加 
  ```
  host  all    all    0.0.0.0/0    md5
  ```
  localhost的也改成md5

  代表允许所有ip段上的所有主机使用所有合法的数据库用户名访问数据库，并提供加密的密码验证。

- 修改 /var/lib/pgsql/10/data 下的postgresql.conf
  
  将#listen_addresses=’localhost’修改为：

  ```
  listen_addresses='*'
  ```

  为避免中毒：端口 
  ```
  port=53721
  ```

  表示允许数据库服务器监听来自任何主机的连接请求

## 操作

- 启动：
  ```
  service postgresql-10 start
  ```

- 停止：
  ```
  service postgresql-10 stop
  ```

- 重启：
  ```
  service postgresql-10 restart
  ```

- 查看服务状态：
  ```
  service postgresql-10 status
  ```

## 修改密码

1. 切换至postgres用户：
   ```
   su - postgres
   ```
2. 登录数据库：
   ```
   psql -U postgres -p 端口
   ```
   -p 在端口更改后需要添加
3. 更改密码：
   ```
   postgres=# \password postgres 
   Enter new password: 
   Enter it again: 
   postgres=# 
   ```
4. 退出：
   ```
   \q
   ```
5. 切换至root：
   ```
   su
   ```

## psql 常用操作

[点击直达](https://www.cnblogs.com/happyhotty/articles/1920455.html)


