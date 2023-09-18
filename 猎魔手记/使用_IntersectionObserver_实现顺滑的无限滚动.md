# 使用 IntersectionObserver  实现顺滑的无限滚动
当滚动列表内容成千上万，不可避免的占用大量内存，导致页面卡顿，影响用户体验；
传统的无线列表实现方式是监听滚动事件并检查滚动位置，但这种方法比较繁琐且容易出错；
不过·现代浏览器提供了 Intersection Observer API，使用它可以更简单地实现无限滚动列表，以提供更流畅的用户体验。

## 定义
IntersectionObserver 提供了一种异步观察目标元素与其祖先元素或顶级文档视口（viewport）交叉状态的方法（百分比）。其祖先元素或视口被称为根（root）。

## 使用 
#### 1 实例化 准备使用

```js
let options = {
  root: document.querySelector("#scrollArea"),
  rootMargin: "0px",
  threshold: 1.0,
};

let observer = new IntersectionObserver(callback, options);
```

- options
	- root
指定根 (root) 元素，用于检查目标的可见性。必须是目标元素的父级元素。如果未指定或者为null，则默认为浏览器视窗。

	- rootMargin
根 (root) 元素的外边距。类似于 CSS 中的 margin 属性，比如 "10px 20px 30px 40px" (top、right、bottom、left)。如果有指定 root 参数，则 rootMargin 也可以使用百分比来取值。该属性值是用作 root 元素和 target 发生交集时候的计算交集的区域范围，使用该属性可以控制 root 元素每一边的收缩或者扩张。默认值为四个边距全是 0。
相当于将父元素的边扩张或缩小，可以达到子元素还未进入父元素就开始做载入；

	- threshold
可以是单一的 number 也可以是 number 数组，target 元素和 root 元素相交程度达到该值的时候 IntersectionObserver 注册的回调函数将会被执行。如果你只是想要探测当 target 元素的在 root 元素中的可见性超过 50% 的时候，你可以指定该属性值为 0.5。如果你想要 target 元素在 root 元素的可见程度每多 25% 就执行一次回调，那么你可以指定一个数组 [0, 0.25, 0.5, 0.75, 1]。默认值是 0 (意味着只要有一个 target 像素出现在 root 元素中，回调函数将会被执行)。该值为 1.0 含义是当 target 完全出现在 root 元素中时候 回调才会被执行。

#### 2 创建一个 observer 后需要给定一个目标元素进行观察。
```js
let target = document.querySelector("#listItem");
observer.observe(target);
```
每当目标满足该 IntersectionObserver 指定的 threshold 值，回调被调用。

#### 3 回调接收 IntersectionObserverEntry 对象和观察者的列表：

```js
let callback = (entries, observer) => {
  entries.forEach((entry) => {
    // Each entry describes an intersection change for one observed target element:
    // entry.boundingClientRect
    // entry.intersectionRatio
    // entry.intersectionRect
    // entry.isIntersecting
    // entry.rootBounds
    // entry.target
    // entry.time
  });
};
```

需注意：注册的回调函数将会在主线程中被执行。所以该函数执行速度要尽可能的快。如果有一些耗时的操作需要执行，建议使用 Window.requestIdleCallback() 方法。

#### 4 小示例
```js
const intersectionObserver = new IntersectionObserver((entries) => {
  // 如果 intersectionRatio 为 0，则目标在视野外，
  // 我们不需要做任何事情。
  if (entries[0].intersectionRatio <= 0) return;
  loadItems(10);
  console.log("Loaded new items");
});
// 开始监听
intersectionObserver.observe(document.querySelector(".scrollerFooter"));
```

#### 5 结合 React 使用  
```js
import React, { useEffect, useRef } from 'react';

const InfiniteScrollList = () => {
  const observer = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    };

    observer.current = new IntersectionObserver(handleObserver, options);
    if (loader.current) {
      observer.current.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.current.unobserve(loader.current);
      }
    };
  }, []);

  const handleObserver = (entries) => {
    if (entries[0].isIntersecting) {
      // 加载更多数据
    }
  };

  return (
    <div>
      {/* 渲染列表内容 */}
      {/* ... */}

      {/* 加载指示器 */}
      <div ref={loader}>Loading...</div>
    </div>
  );
};
```

也可以将渲染列表内容一次赋予 `observer` 进行监听，在不在窗口内的时候进行卸载，从而优化性能；

## 应用方向
- 图片懒加载——当图片滚动到可见时才进行加载
- 内容无限滚动——也就是用户滚动到接近内容底部时直接加载更多，而无需用户操作翻页，给用户一种网页可以无限滚动的错觉
- 检测广告的曝光情况——为了计算广告收益，需要知道广告元素的曝光情况
- 在用户看见某个区域时执行任务或播放动画

---

[点击查看应用实例](http://www.xiapazi.site/#/blenderModel)