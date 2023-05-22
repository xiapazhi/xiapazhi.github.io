# 更好用的滚动条美化组件 simplebar-react

## 使用背景：
项目中多延续使用 perfect-scrollbar 对滚动条进行美化使用，不可否认 perfect-scrollbar 有着更为详细的以及精准的使用方式，同时也带来了使用过于复杂的问题；

- perfect-scrollbar 不但需要初始化

```
newScrollbar = new PerfectScrollbar("#news", {
      suppressScrollX: true,
});
```

- 还需要在新数据加载后及时更新

```
 newScrollbar.update();
```

- 对于滚动元素的父级，还必须设置`position: relative`

```
<div id='news' style={{ height: 578, position: 'relative',  }}>
```

对于不熟悉 perfect-scrollbar 组件且不需要更加多维设置滚动条的同学来说， 增加了不必要的使用成本，徒增调试时间；所以本期介绍一款易用的适用 React 的滚动条美化工具 `simplebar-react`

## simplebar-react

- 安装使用

```
npm i simplebar-react --save
```

- 简单使用    

引入 css
```
@import '~simplebar-react/dist/simplebar.min.css';
```

```
import SimpleBar from 'simplebar-react';

<SimpleBar
   style={{
	  // 容器高度
	  height: 320, 
   }}
   // 允许的滚动方向
   forceVisible="y"
>
 Content
</SimpleBar>
```

- 监听滚动（用于持续加载数据/无限滚动/定位等场景）

```
<SimpleBar
   style={{
	  // 容器高度
	  maxHeight: '100%', 
   }}
   // 允许的滚动方向
   forceVisible="y"
	 // 监听滚动
   onScroll={(e) => {
	    if (e.target.scrollTop + 600 > e.target.scrollHeight) {
			// 建议设置节流函数
		   // DO SOMETHING
        }
   }}
>
 Content
</SimpleBar>
```

- 设置滚动位置

```
const scrollableNodeRef = React.createRef();

useEffect(()=>{
  // 将滚动位置初始化
	scrollableNodeRef.current.scrollTop = 0
},[xxx])
 
<SimpleBar
   style={{
	  // 容器高度
	  maxHeight: '100%', 
   }}
   // 允许的滚动方向
   forceVisible="y"
   scrollableNodeProps={{ ref: scrollableNodeRef }}
>
 Content
</SimpleBar>
```

以上，可以满足绝大多数的滚动条使用情况

