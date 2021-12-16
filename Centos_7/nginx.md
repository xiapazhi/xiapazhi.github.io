# Nginx

实践

## 安装依赖

1. SSL功能需要openssl库: 

    ```bash
    yum install openssl
    ```

2. gzip模块需要zlib库: #

    ```bash 
   yum install zlib
   ```

3. rewrite模块需要pcre库: #
    ```bash
    yum install pcre
    ```

## 安装 Nginx

1. 使用yum安装nginx需的库：
    ```bash
    rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
    ```
2. 安装nginx：
    ```
    yum install nginx
    ```
3. 启动Nginx：
    ```
    service nginx start
    ```
4. 查看状态：
    ```
    systemctl status nginx.service
    ```
5. 重启：
    ```
    service nginx restart
    ```

## 可能遇到的错误

1. connect() to 127.0.0.1:3000 failed (13: Permission denied) while connecting to upstream：

    原因：据说是 - SeLinux 导致 

    解决：执行 

    ```
    setsebool -P httpd_can_network_connect 1
    ```

# 修改配置

- 文件位置：/etc/nginx/
- 日志位置：/var/log/nginx

- 作为简单的文件下载服务（竟然可以播放视频）

    ```
    server {  
        listen       80;        #端口  
        server_name  localhost;   #服务名  
        charset utf-8; # 避免中文乱码
        root    /dev/shm/update;  #显示的根索引目录

        location / {
            autoindex on;             #开启索引功能  
            autoindex_exact_size off; # 关闭计算文件确切大小（单位bytes），只显示大概大小（单位kb、mb、gb）  
            autoindex_localtime on;   # 显示本机时间而非 GMT 时间  
        }
    } 
    ```
- 作为代理 如 flask：

    ```
    http {
        server {
            listen       80; 
            server_name  localhost;
            location / {
                proxy_pass http://127.0.0.1:7000; #falsk 或什么服务 启动的端口
                client_max_body_size 24M; // 文件上传大小限制 据说可以写在别的地方 代表不同级别的限制
            }
        }
    }
    ```

- 开启压缩和缓存 [质子源 实例]
    
    ```
    http {
        #proxy_cache_path / levels=1:2 keys_zone=nuget-cache:20m max_size=1g inactive=24h use_temp_path=off;

        # 开启gzip
            gzip on;
        # 启用gzip压缩的最小文件；小于设置值的文件将不会被压缩
            gzip_min_length 1024k;
        # gzip 压缩级别 1-10
            gzip_comp_level 3;
        # 进行压缩的文件类型。
            gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        # 是否在http header中添加Vary: Accept-Encoding，建议开启
            gzip_vary on;

            access_log off;

        server {
            listen 80;
            server_name proton;

            location / {
                proxy_pass http://localhost:5000;
                access_log off;
                client_max_body_size 1024M;
                add_header Cache-Control max-age=no-cache;
            }

            location ~* \.(css|js|png|jpg|jpeg|mp4)$ {
                add_header Cache-Control "private,max-age=30*24*3600";
                expires 30d;
                access_log off;
                proxy_pass http://localhost:5000;
            }
        }
    }
    ```

- 代理 [Clover [vue2]实例]

    ```
    user  nginx;
    worker_processes  auto;

    error_log  /var/log/nginx/error.log notice;
    pid        /var/run/nginx.pid;

    events {
        worker_connections  1024;
    }

    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for"';

        #access_log  /var/log/nginx/access.log  main;
        access_log  off;

        sendfile        on;
        #tcp_nopush     on;

        keepalive_timeout  65;

        gzip  on;
        gzip_min_length 512k;
        gzip_comp_level 6;
        gzip_vary on;
        gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;

        include /etc/nginx/conf.d/*.conf;

        server{
            listen       8080;
            server_name  clover;
            root        /var/site/clover/site/dist;#vue项目的打包后的dist

            location /_api/ {
                proxy_pass	http://127.0.0.1:7002/;
            }

            location /_file/ {
                proxy_pass	http://127.0.0.1:7002/;

                add_header Cache-Control "private,max-age=30*24*3600";
                expires 30d;
                access_log off;
            }

            location ~* \.(css|js)$ {
                add_header Cache-Control "private,max-age=30*24*3600";
                expires 30d;
                access_log off;
            }
            
        }
    }
    ```