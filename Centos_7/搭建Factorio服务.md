转载：http://www.20949.net/post/4.html

## 系统更新 更换源

1. 首先备份原来的源，以防不可预测的错误能有恢复的余地

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```

2. 导入阿里云Centos7源

```bash
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

3. 添加EPEL

```bash
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

4. 清除YUM缓存

``` bash
yum clean all
```

5. 缓存阿里云源

```bash
yum makecache
```

- 至此已经成功更换，可以更新系统（非必要，时间较久）

6.如更新了系统记得重启

```bash 
yum -y update
```

## Centos glibc-2.18 环境编译

1. 安装gcc与wget

```bash
yum install gcc -y
yum install wget -y
```

2. 下载glibc-2.18.tar.gz

```bash
wget http://ftp.gnu.org/gnu/glibc/glibc-2.18.tar.gz
```

3. 解压并进入到glibc-2.18

```bash
tar -xvf glibc-2.18.tar.gz
cd glibc-2.18
```

4. 创建build文件夹

```bash
mkdir build
cd build
```

5. 编译

```bash
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
make -j 8
make install
```

## screen 安装

Screen是一个可以在多个进程之间多路复用一个物理终端的全屏窗口管理器。

用户可以在一个screen会话中创建多个screen子会话，在每一个screen会话（或子会话）中就像操作一个真实的telnet/SSH连接窗口

```bash
yum install screen -y
```

## 防火墙例外

默认 CentOS7 使用的防火墙 firewalld

- 查看防火墙状态

```bash
firewall-cmd --state 
或者
systemctl status firewalld
```

返回success代表已开启

如果关闭状态以下步骤可以不执行 也可以自行选择是否继续，默认是为了安全我们打开防火墙

- 状态关闭，需要启动防火墙

```bash
systemctl start firewalld
```

- 开机启用

```bash
systemctl enable firewalld
```

- 开放factorio指定端口

```bash
firewall-cmd --zone=public --add-port=34197/udp --permanent
```

- 当然ssh端口以防万一 也加上

```bash
sudo firewall-cmd --zone=public --permanent --add-service=ssh
```
- 重新载入，使配置生效

```bash
sudo firewall-cmd --reload
```

## Factorio 服务端准备

1. 下载程序 最新版 或按需

```bash
cd ~
wget https://www.factorio.com/get-download/1.1.27/headless/linux64
```

2. 解压压缩包

```bash
tar -xvf linux64
```

3. 推荐将项目移动到 /opt目录下

```bash
mv -f /root/factorio /opt/factorio
```

4. 编辑配置文件

进入/opt/factorio/data文件夹，编辑server-settings.example.json文件

```bash
cd /opt/factorio/data
cp server-settings.example.json server-settings.json
```

必要的一些设置

```
  "name": "[CN]服务器名字",  
  "description": "服务器描述",  
  "username": "factorio官网注册的账户",  
  "password": "factorio密码",  
  "token": "设置token 格式类似b50704b226ab50704b226ab50704b226a",
  ...
```

5. 生成地图

第一次建立服务器 无论有没有地图 都需要执行一下 生成地图命令 才能正确加载

```bash
cd /opt/factorio
./bin/x64/factorio --create ./saves/test1.zip
```

6. 开服

- 因为Factorio SSH命令独占 所以使用之前安装screen 命令 来达到后台运行

```ssh
screen -S factorio
```

注意这个参数是 大写S

- 指定地图命令开服

```ssh
/opt/factorio/bin/x64/factorio --config /opt/factorio/config/config.ini --port 34197 --start-server /opt/factorio/saves/test1.zip --server-settings /opt/factorio/data/server-settings.json
```

这个端口号可以随便换  记得防火墙也开通一下

- 以 saves 文件内最新地图存档开服命令

```ssh
/opt/factorio/bin/x64/factorio --start-server-load-latest --server-settings /opt/factorio/data/server-settings.json
```

然后直接退出SSH窗口即可

7. 管理命令

- 登陆服务器, 连接SSH后, 显示后台执行的ssh命令行

```ssh
screen -ls
```

输出

```ssh
 There is a screen on: 1051.factorio_auto (Attached)1 Socket in /var/run/screen/S-root.
```

连接进去screen 输出前面有进程ID 可以直接使用ID登陆（ID是动态的）

```ssh
screen -r 1051
```

- 立即存档

登陆进 sceen 后,直接输入

```ssh
/server-save
```

即可存档

- 退出factorio服务器

登陆进sceen后 直接按 <kbd>Centr</kbd>+<kbd>C</kbd>,服务器关闭

## 开机自启动

因为Factorio SSH命令独占 开机启动命令选用 screen 带saves文件内最新地图存档开服命令

建立开机脚本

```ssh
cd /opt/factorio
mkdir startcd start
touch screen.shvi screen.sh
```

INSERT内容如下

```ssh
screen_name="factorio_auto"screen -dmS $screen_name
cmd="/opt/factorio/start/factorio-run.sh";
screen -x -S $screen_name -p 0 -X stuff "$cmd"screen -x -S $screen_name -p 0 -X stuff '\n'

```

输入 `:wq` 保存

```
touch factorio-run.shvi screen.sh
```

INSERT内容如下

```ssh
/opt/factorio/bin/x64/factorio --start-server-load-latest --server-settings /opt/factorio/data/server-settings.json
```

输入 `:wq` 保存

授予执行权限

```ssh
chmod +x factorio-run.shchmod +x screen.sh
```

编辑rc.local 最后一行加入上面建立的脚本

```
vi /etc/rc.d/rc.local
... ...
/opt/factorio/start/screen.sh
```

授予执行权限

```
chmod +x /etc/rc.d/rc.local
```

## 配置文件翻译

```json
{
  "name": "你服务器的名称，会出现在游戏列表中。字符不要太长",    
  //这边的名字可以用[color=#ff0000]文字[/color] 这样来改变颜色

  "description": "描述你的服务器",
  "tags": ["game", "标签"],

  "_comment_max_players": "允许的最大玩家数，管理员无效，0表示无限制",
  "max_players": 0,

  "_comment_visibility": ["public: 公开，游戏会在互联网游戏中出现true表示打开",
  "lan: 局域网，表示游戏会在局域网游戏中出现。"],
  "visibility":
{
  "public": true,
  "lan": true
},

  "_comment_credentials": "如果你想在互联网游戏中显示，则需要登录factorio账号",
  "username": "",
  "password": "",

  "_comment_token": "如果你担心密码泄露，可以填写token身份令牌。在官网登录后点击你的名字，就可以获取",
  "token": "",

  "_game_password": "进入服务器的密码，留空为无",
  "game_password": "",

  "_comment_require_user_verification": "设置为true时，需要验证客户端是否有factorio账号登录,俗称正版验证",
  "require_user_verification": true,

  "_comment_max_upload_in_kilobytes_per_second" : "最大上传宽带，单位是KB/S，0表示无限制",
  "max_upload_in_kilobytes_per_second": 0,

  "_comment_minimum_latency_in_ticks": "不明，也许是限制最高ping？",
  "minimum_latency_in_ticks": 0,

  "_comment_ignore_player_limit_for_returning_players": "即使达到最大人数，以前来玩过的玩家依然可以加入",
  "ignore_player_limit_for_returning_players": false,

  "_comment_allow_commands": "允许谁运行命令，true全部人, false全部人不允许，admins-only仅管理员",
  "allow_commands": "admins-only",

  "_comment_autosave_interval": "自动保存间隔（分钟）",
  "autosave_interval": 10,

  "_comment_autosave_slots": "自动保存的存档数量。",
  "autosave_slots": 5,

  "_comment_afk_autokick_interval": "玩家长时间不动踢出游戏，0表示不踢",
  "afk_autokick_interval": 0,

  "_comment_auto_pause": "服务器中没有玩家，自动暂停服务器",
  "auto_pause": true,

  "_only_admins_can_pause_the_game": "只有管理员可以暂停游戏",
  "only_admins_can_pause_the_game": true,

  "_comment_autosave_only_on_server": "自动保存只保存在服务器上。",
  "autosave_only_on_server": true,

  "_comment_admins": "管理员列表，不区分大小写。",
  "admins": []
}
```

管理员添加

server-adminlist.json

```
[ "名字" ]
```

设置游戏/行走速度(默认是1)

```
/c game.speed = 2	
```

高速度可能会影响帧率