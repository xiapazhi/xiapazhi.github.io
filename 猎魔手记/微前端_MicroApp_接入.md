# 微前端 MicroApp 接入

>2022-08-31 09:39:44

## 背景 

**视频平台的镜像服务是为其他平台的视频播放模块提供配置与播放功能的服务，需要可以嵌套在其他应用中，为了可以更快载入视频平台的镜像服务预研微前端；**

## 主流框架
1. 阿里乾坤 qiankun：这个框架需要在主、子项目开工前就规划好要嵌套合用的逻辑，对于react、路由、webpack都有较高的要求；

2. 腾讯无界 ：使用 ifream 进行样式与js隔离，效果最好，但是对 react 版本要求 至少 16，对于一些老项目需要改动的代码较多；

3. 京东 MicroApp ：需要 webpack v5，相对来说只要改动 webpack 配置即可；

## MicroApp 使用

1. ### 基本要求

    使用 Webpack v5 进行构建；

2. ### 应用配置
   
    1.  #### 基座应用配置

        所谓基座，是相对于子系统来说的，也就是将要使用视频播放页的系统；
 
        1. 首先 应安装 @micro-zoe/micro-app 包；

        2. 开发环境中，需要在 webpack.config.js 中为 MicroApp 配置跨域，

            ```json
                devServer: {

                    historyApiFallback: true,

                    // 为 MicroApp 配置跨域

                    'Access-Control-Allow-Origin': '*',

                },
            ```
        3. 在项目的入口文件 也就是 src/index.js 中添加
            ```js
                import microApp from '@micro-zoe/micro-app'
            
                microApp.start({

                    // tagName: 'micro-app-anxin',

                })
            ```

        4. 在需要展示子应用的页面引入
            ```js
                import microApp from '@micro-zoe/micro-app'

                <div style={{ height: clientHeight - 100, overflow: 'auto'}}>
                <micro-app
                    name='microapp-test'
                    url='http://localhost:5000/'
                    baseroute='/microApp'
                    // inline
                    // disableSandbox
                    // shadowDOM
                    style={{ height: '100%' }}
                >
                    microApp
                </micro-app>
                </div>
            ```
            即可看到 localhost：5000 所启动的系统页面

            包裹在 micro-app 外的div 以及 micro-app 标签的样式 height：‘100%’都能为所嵌入的系统提供更好的样式计算基准；

 
    2. #### 子应用配置
        在 src 下创建 public-path.js
        ```js
            // __MICRO_APP_ENVIRONMENT__和__MICRO_APP_PUBLIC_PATH__是由micro-app注入的全局变量

            if (window.__MICRO_APP_ENVIRONMENT__) {
                // eslint-disable-next-line
                __webpack_public_path__ = window.__MICRO_APP_PUBLIC_PATH__
            } else {
                __webpack_public_path__ = '/'
            }
        ```
        并在 入口文件 src/index.js 的最上边引入

        ```js
            'use strict';

            import './public-path'
        ```

        此处使用了 webpack 的公共路径全局变量 __webpack_public_path__ ，在使用 MicroApp的时候由其自动注入并拼接在子系统的静态资源前；

        所以引入静态资源的地方应改为

        ```js
            src={`${__webpack_public_path__}assets/xxx
        ```
        
    3. #### 基座与子应用参数传递
        1. 基座向子应用传递数据
            ```js
                import microApp from '@micro-zoe/micro-app'
                microApp.setData('microapp-test', {
                action: 'initMicro',
                data: {
                    token: '43f81d53-9cb4-4934-9c13-13ab073b2c43'
                }
                })
            ```

        2. 子应用接收基座数据
            监听信息
            ```js
                // MicroApp
                const microAppListen = async (data) => {

                console.log('xxxx', data);

                if (data.action == 'initMicro') {
                        setMicroAppWaiting(false)
                    }
                }

                if (window.__MICRO_APP_ENVIRONMENT__) {
                    console.info('MicroApp')
                    window.microApp.addDataListener(microAppListen, true)
                } else {
                    console.info('NOT MicroApp')
                    setMicroAppWaiting(false)
                }
            ```

3. ### 引入 MicroApp 后的注意事项
    1. 合并后的系统实际渲染在同一个页面，同一个域，所以 session 里的信息也是存在一起的，不同系统使用的 session 命名应确保唯一，不然会有覆盖的风险；比如 ‘user’；
   
        所以更新了 @peace/utils 包到 0.0.64 版本，在使用 basicAction 之前，可以引入 customWebUtils 指定所要存储的user 的key值名称

        utils/webapi
        ```js
            import { ProxyRequest, customWebUtils } from "@peace/utils";

            export const webUtils = new customWebUtils({
            userKey: 'vcmpUser'
            });

            const { basicAction, RouteRequest } = webUtils
            export {
            basicAction, RouteRequest
            }
        ```

        再写action的时候使用此处导出的 basicAction 即可使用指定的 session key值取的 token进行鉴权

    2.现有系统整体宽高一般都以clientHeight 或 body 为基准，作为子系统嵌入后应以所包裹的 div 为基准，所以在子系统中，获取整体宽高以计算的基准应取自根节点，比如：

    ```js
        // index.html

        <div id='VcmpApp' style="height: 100%;"></div>

        // 监听宽高
        const resize_ = () => {
            dispatch(resize(
                document.getElementById('VcmpApp').clientHeight,
                document.getElementById('VcmpApp').clientWidth
            ));
        }
    ```


 

