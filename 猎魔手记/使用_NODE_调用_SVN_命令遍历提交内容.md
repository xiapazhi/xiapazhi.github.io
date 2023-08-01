#### 使用 Subversion 可用于管理 Svn 仓库中的代码和文件。

[Subversion Windows 版本下载地址](https://subversion.apache.org/)

---

常用的命令有如下几种

- ## 首先以获取指定版本的文件内容为例
    要获取指定版本的文件内容，可以使用以下命令，且无需将仓库检出到本地：

    ```js
    svn cat -r <revision_number> <file_path>
    ```

    其中，revision_number 是要获取的版本号，file_path 是文件路径。这个命令会将指定版本的文件内容输出到控制台。
   ### 配合 NODE 使用
 
     - #### 简单使用可以借助  `node-svn-ultimate` 包，安装后
     
    	 ```js
    	 const svnUltimate = require('node-svn-ultimate');
    	 // 因为是异步操作，我们可以借助 Promise 的力量
    	 new Promise((resolve, reject) => {
    		 svnUltimate.commands.cat(
    				command,
    				{
    					 username:'xxx',
    					 password:'xxx',
    					 maxBuffer: 1280,
    				},
    				function (err, data) {
    					 if (err) {
    							reject(err)
    					 } else {
    							resolve(data)
    					 }
    				}
    		 )
    	 })
    	 ```
    	 
    	 其中 command 即为想要执行的 svn cat 命令，一般包括要查看的文件的路径信息等；
    	 maxBuffer 是对 node 子进程缓冲区的大小设置，如文件较大，则需要较大的缓冲区缓存文件信息；
    	 
    	 ---
    	 
    	 > exec函数的maxBuffer参数的默认大小取决于使用的Node.js版本。

    	 >在Node.js v12及更高版本中，默认的maxBuffer大小是200kb（200 \* 1024字节）。

    	 >在Node.js v10及更低版本中，默认的maxBuffer大小是200kb（200 \* 1024字节）。 
    	 
    	 ---
    	 
     - #### 若工具包不能满足使用需求则可以直接使用 node 的 `child_process` 在安装了 `Subversion` 的基础上，直接调用 svn 命令，获得返回内容，再进一步进行分析；
     
     ```js
     const { exec, execSync } = require('child_process');
     Promise((resolve, reject) => {
    		 exec(command, { maxBuffer: 1280 }, (error, stdout, stderr) => {
    				if (error) {
    					 console.error(`执行出错: ${error.message}`);
    					 reject(error)
    				}
    				if (stderr) {
    					 console.error(`命令错误: ${stderr}`);
    					 reject(stderr)
    				}
    				if (xml) {
    					 resolve(xmlParser.parse(stdout))
    				} else {
    					 resolve(stdout)
    				}
    		 });
    	})
     ```
     
     - #### 若文件过于巨大，强行设置 maxBuffer 已略显尴尬，则可以使用本次预研的最终进化版本 --  使用 `spawn` 与异步进程进行交互，从而逐步读取文件内容；
     
     ```javascript
     return new Promise((resolve, reject) => {
    		 /** 使用子进程逐渐获取日志内容 解决内存不足 */
    		 /** useSvnProcess */
    		 // 启动 svn 命令子进程
    		 const svnProcess = spawn(
    				'svn',
    				['log','http://svn.xxx.cn/xx/x','其他参数'],
    				{
    					 stdio: 'pipe'
    				}
    		 );

    		 let svnLog = ''
    		 // 逐行读取并处理输出
    		 svnProcess.stdout.on('data', (data) => {
    				const lines = data.toString();
    				svnLog += lines
    		 });

    		 // 监听子进程的 stderr 流，获取错误信息
    		 svnProcess.stderr.on('data', (data) => {
    				reject(data.toString())
    		 });

    		 // 监听子进程结束事件
    		 svnProcess.on('close', (code) => {
    				tLog(`子进程退出，退出码：${code}`);
    				if (code == 0) { 
    					 resolve(svnLog)
    				}
    		 });
    	})
     ```
 
- ## 获取指定路径的提交日志（谁在什么时候提交或修改了改路径内容，并备注了什么信息）

	```javascript
        // 从最新版开始获取
        svn log <repository_url>
        // 限制 log 数量 3 条
        svn log <repository_url> -l 3
        // 从指定版本开始获取
        svn log <repository_url> -r <revision_number>
        // 指定版本区间
        svn log <repository_url> -r <revision_start_number>:<revision_end_number>
        //  以 xml 格式返回内容
        svn log <repository_url> --xml
	```
 以 xml 格式返回内容更有利于程序解析日志信息
 
 若文件在某个版本被删除，则查询之前的日志信息会报错可以通过在路径后添加 `@ <revision_start_number>`的方式强调
 
 ```javascript
 // 强调从指定版本开始获取 避免因删除而报错的情况
 svn log <repository_url>@ <revision_start_number> -r <revision_start_number>:<revision_end_number>
 ```
 
 - 巧用 log 命令，获取文件的上一次更改版本 -- 为内容比对做准备
 
 ```javascript
 svn log <repository_url>@ <revision_start_number> -r <revision_start_number>:0 -l 1
 ```
 
 通过以上命令，将版本区间指定为当前要查询的 `revision_start_number` 到 开始版本 `0` 之间，但是只取一条数据，则返回结果为该文件上一次的修改版本，再通过 `diff` 命令指定两个版本，即可比对修改内容;
 
- ## 获取 svn 仓库的整体信息

```javascript
svn info <repository_url> --xml
```

可以结构出当前仓库的最新版本号等信息
 
- ## 使用 Diff 进行文件对比以获取文件差异信息
要使用 Diff 进行文件对比以获取文件差异信息，可以使用以下命令：

	```javascript
	svn diff -r <revision1>:<revision2> <file_path>
	// 以 xml 格式返回内容
		svn diff -r <revision1>:<revision2> <file_path> --xml
	// 仅返回统计内容
	svn diff -r <revision1>:<revision2> <file_path> --summarize
	// 综合一下
	svn diff -r <revision1>:<revision2> <file_path> --xml --summarize
	```
	
其中，revision1 是要对比的第一个版本号，revision2 是要对比的第二个版本号,可以通过获取更改日志信息的方式指定获取，file_path 是文件路径。这个命令会将两个版本的文件内容进行对比，并输出不同之处的具体信息，以 `+`标志增添的行，以`-`标志删减的行；

- ## 获取被删除文件夹的文件列表
要获取被删除文件夹的文件列表，可以使用以下命令：

```javascript
svn diff <repository_url>/<directory_url>@<revision_number> -r <revision_number>:<revision_number> - 1 --xml --summarize
```

其中，revision_number 是被删除文件夹的最后一个存在的版本号，repository_url 是 SVN 服务器的 URL，directory_url 是文件夹的路径。`<revision_number> - 1` 是表达式，需要提前计算好，当前版本号减1，两个相连版本做 diff 对比

---

通过以上内容即可使用 node 遍历 svn 内容，然后通过`diff-match-patch`、`fast-diff`、`diff` 等工具包进行内容比对，或对内容进行自定义审查；