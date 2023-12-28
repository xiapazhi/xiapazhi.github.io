# K8S 应用
---

## 创建 Pod

- 自主式 Pod
  > 直接定义一个Pod资源

   举个栗子

   ```
   vim pod-try-go.yaml
   ```
   
   ```
   apiVersion: v1          # api 版本
   kind: Pod               # 创建的资源
   metadata:
      name: go-test        # Pod 的名字
      namespace: default   # Pod 所在的名称空间
      labels:
         app: go           # 标签
   spec:                   # 规格说明（specification 的简称）
      # activeDeadlineSeconds: 600  # Pod 运行的最长时间
      containers:          # 容器列表
      - name: gogogo       # 容器的名字
         ports:
         - containerPort: 8080            # 容器端口
           # hostIP: 127.0.0.1            # 指定绑定的宿主机 IP
           # hostPort: 8080               # 在宿主机上映射的端口
         image: registry.cn-hangzhou.aliyuncs.com/ali-21-docker/ali-c317:try_go
         imagePullPolicy: IfNotPresent    # 镜像拉取策略
                                             # Always：不管本地是否存在镜像，都要重新拉取镜像
                                             # Never： 从不拉取镜像
                                             # IfNotPresent：如果本地存在，使用本地的镜像，本地不存在，从官方拉取镜像
   ```

   - 启动 Pod
      ```
      kubectl apply -f pod-try-go.yaml
      ```

      修改 yaml 文件后直接重新执行此命令可更新 Pod

   - 查看 Pod
      ```
      kubectl get pod -o wide -l app=go
      ```
      ![](../_media/Centos_7/K8S_应用/pod.png)

   - 查看pod日志

      ```
      kubectl logs go-test
      ```

   - 进入 Pod
      ```
      kubectl exec -it go-test -- /bin/bash
      ```

      - 进入 Pod 里的指定容器
        ```
        kubectl exec -it go-test --container=gogogo -- /bin/bash

        kubectl exec -it go-test -c gogogo -- /bin/bash
        ```

      - 退出
         ```
         exit
         ```
   
   - 查看 Pod 详细信息
     ```
     kubectl describe pods go-test
     ```

   - 查看 Pod 标签
     ```
     kubectl get pods --show-labels
     ```

   - 删除 Pod
      ```
      kubectl delete pods go-test

      kubectl delete -f pod-try-go.yaml
      ```

- 控制器式 Pod
  > 利用控制器来管理 Pod 资源，确保 Pod 始终维持在指定的副本数运行

  > 常见的管理Pod的控制器：Replicaset、Deployment、Job、CronJob、Daemonset、Statefulset。

   举个栗子：通过 Deployment 管理Pod

   ```
   vim pod-try-go-controller.yaml
   ```
   ```
   apiVersion: apps/v1
   kind: Deployment
   metadata:
      name: go-controller-test
      namespace: default
      labels:
         app: go
   spec:
      selector:
      matchLabels:
         app: app-go
      replicas: 2
      template:
      metadata:
         labels:
            app: app-go
      spec:
         containers:
         - name: go-con
            ports:
            - containerPort: 8080
            image: registry.cn-hangzhou.aliyuncs.com/ali-21-docker/ali-c317:try_go
            imagePullPolicy: IfNotPresent
   ```

   - 查看 Deployment
      ```
      kubectl get deployment
      ```
      ![](../_media/Centos_7/K8S_应用/deploy.png)

   其余命令与自主式 Pod 相同。

- 通过命令行创建 Pod
  > 通过 `kubectl run` 创建 Pod

  举个栗子
  ```
  kubectl run go-test --image=registry.cn-hangzhou.aliyuncs.com/ali-21-docker/ali-c317:try_go --port=8080 --image-pull-policy='IfNotPresent'
  ```

## 创建 Pod 的流程

![](../_media/Centos_7/K8S_应用/创建Pod流程.png)

kubeconfig 环境变量 或 /root/.kube/config 中存储着 k8s 的集群信息，决定着 apiserver 、用户名等上下文信息；

- 第一步：
  
   基于 kubeconfig 或 /root/.kube/config 认证后，kubectl 向 apiserver 提交创建 pod 的请求，apiserver 接收到 pod 创建请求后，会将 pod 的属性信息(metadata)写入 etcd。

- 第二步：
  
   apiserver 触发 watch 机制准备创建 pod，信息转发给调度器 scheduler，调度器使用调度算法选择 node 节点，调度器将 node 信息给 apiserver，apiserver 将绑定的 node 信息写入 etcd。

- 第三步：
  
   apiserver 又通过 watch 机制，调用 kubelet，指定 pod 信息，调用容器运行时创建并启动 pod内的容器。

- 第四步：
  
   创建完成之后反馈给 kubelet, kubelet 又将 pod 的状态信息给 apiserver, apiserver 又将 pod 的状态信息写入 etcd。