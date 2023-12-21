# Golang

---

## 安装

### Centos

```bash
yum install go
```

### 一般安装

- 下载 Go 语言安装包
  ```
  wget https://golang.org/dl/go1.15.4.linux-amd64.tar.gz
  ```
  >如果版本 1.15.4 不是最新版本，则可能需要更改版本号。

- 解压安装包
   ```
   tar -C /usr/local -xzf go1.15.4.linux-amd64.tar.gz
   ```
- 设置环境变量
   - 方式 1
      ```
      export PATH=$PATH:/usr/local/go/bin
      ```
      >关闭并重新打开终端提示符，以更新 $PATH 环境变量。 也可以通过运行以下命令强制更新：
      ```
      source $HOME/.profile
      ```

   - 方式 2
      ```
      echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc  
      source ~/.bashrc
      ```

- 验证安装
   ```
   go version
   ```

### 设置代理 / 下载更快喔

- 设置代理
  ```
  go env -w GOPROXY=https://goproxy.cn,direct
  ```
  > 注意：如果你的网络环境不允许使用代理，那么将 `GOPROXY` 设置为 `direct`。

---

## HELLO GO
   ```
   // main.go

   package main

   import "fmt"

   func main() {
      fmt.Println("Hello World!")
   }
   ```
   - 下载引用到的包
      ```
      go mod tidy
      ```

   - 初始化项目
       ```
       go mod init 项目名
       ```
   - 构建源码
       ```
       go build -o 构建的二进制文件名 main.go
       ```
   - 运行程序
       ```
       go run main.go
       ```