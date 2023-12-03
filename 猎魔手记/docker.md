## 环境安装和配置

> 以 Centos 为例

1. 更改主机名称
   ```
   hostnamectl set-hostname docker-learn && bash
   ```
   `bash` ：更新环境变量
2. 禁用防火墙
   1. 停止
        ```
        systemctl stop firewalld
        ```
    2. 禁用
        ```
        systemctl disable firewalld
        ```

        如遇报错`Failed to disable unit: Access denied`
        ```
        sudo systemctl disable firewalld
        ```
3. 禁用 SELinux
   
   SELinux代表安全增强型Linux（Security-Enhanced Linux），它是Linux内核的一个安全模块，旨在提供强化的访问控制和安全策略机制。它通过强制访问控制（MAC）机制，为Linux系统提供了更细粒度的安全策略。

   1. 临时禁用
        ```
        sudo setenforce 0
        ```
        命令中的 setenforce 是一个工具，用于修改SELinux的执行模式。SELinux有三种执行模式：

        - Enforcing（强制执行）：在这种模式下，SELinux会强制执行安全策略，阻止未经授权的访问。

        - Permissive（宽容模式）：在这种模式下，SELinux会记录但不阻止违规操作，通常用于诊断和调试。

        - Disabled（禁用）：这个状态下，SELinux被完全禁用，不会对系统进行任何访问控制。

        执行 `sudo setenforce 0` 会将SELinux切换到宽容模式（Permissive），这意味着SELinux会记录违反安全策略的操作，但不会阻止它们。这在诊断系统问题时可能有用，因为你可以查看SELinux日志，了解哪些操作被拦截。

        需要注意的是，这种修改只是临时的。一旦系统重启，SELinux会恢复到它之前的状态。

    2. 永久禁用    
        更改配置文件
        ```
        sudo vi /etc/selinux/config
        ```
        修改为
        ```
        #SELINUX=enforcing
        SELINUX=disabled
        ```
        重启
        ```
        reboot
        ```
        验证
        ```
        getenforce
        ```
        若修改成功，则输出`DISABLED`

4. 时间同步
   1. 安装同步软件 ntpdate
   
        Centos < 8：
        ```
        yum install -y ntpdate

        配置 ntpdate 时间源
        ntpdate cn.pool.ntp.org
        ```

        Centos >= 8: 使用 chrony
        ```
        yum install -y chrony

        ·
        ·
        ·
        ```

## 安装 docker

> docker-ce 社区版

1. 配置国内 yum 源（阿里云）
   ```
   yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
   ```

2. 安装 docker 依赖包
    ```
    yum install -y yum-utils device-mapper-persistent-data lvm2
    ```

3. 安装 docker-ce
    ```
    yum install -y docker-ce
    ```

4. 查看版本
    ```
    docker version
    ```

5. 启动并设置开机启动
    ```
    systemctl start docker && systemctl enable docker
    ```

6. 查看运行状态
    ```
    systemctl status docker
    ```