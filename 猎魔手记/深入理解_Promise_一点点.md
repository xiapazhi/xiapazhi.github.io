# 深入理解 Promise 一点点

## Promise的含义
promise是异步编程的一种解决方法,比传统的回调函数和事件更合理更强大。他由社区最早提出和实现，ES6将其写进语言标准，统一了用法，原生提供了promise对象。
所谓promise，简单说是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果，从语法上说，promise是一个对象，从它可以获取异步操作的消息，promise提供了统一的API，各种异步操作都可以用同样的方法进行处理。

## promise对象的特点
- 对象的状态不受外界影响，promise对象代表一个异步操作，有三种状态，pending（进行中）、fulfilled（已成功）、rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态，这也是promise这个名字的由来“承若”；
- 一旦状态改变就不会再变，任何时候都可以得到这个结果，promise对象的状态改变，只有两种可能：从pending变为fulfilled，从pending变为rejected。这时就称为resolved（已定型）。如果改变已经发生了，你再对promise对象添加回调函数，也会立即得到这个结果，这与事件（event）完全不同，事件的特点是：如果你错过了它，再去监听是得不到结果的。

  有了Promise对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise对象提供统一的接口，使得控制异步操作更加容易。

  Promise也有一些缺点。
	首先，无法取消Promise，一旦新建它就会立即执行，无法中途取消。
	其次，如果不设置回调函数，Promise内部抛出的错误，不会反应到外部。
	最后，当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 用法

promise对象是一个构造函数，用来生成promise实例;
创建一个promise对象实例

``` js
var promise = new Promise( function( resolve, reject) {
    //some code  
    if(//异步操作成功){ 
		    resolve(value); 
		} else { 
		    reject(error); 
		} 
});
```

Promise构造函数接收一个函数作为参数，该函数的两个参数分别是resolve和reject，他们是两个函数，由Javascript引擎提供，不用自己部署。

resolve函数的作用是，将promise对象的状态从“pending”变为‘’resolved‘’，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；

reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数

```
promise.then( function(value){ 
   //success 
}, function(error){ 
   //failure 
});
```
then方法可以接受连个回调函数作为参数，第一个回调函数是promise对象的状态变为resolved时调用，第二个回调函数是promise对象的状态变为rejected时调用，其中，第二个函数是可选的，不一定要提供，这两个函数都接受promise对象传出的值作为参数；

promise对象的简单例子

```
function timeOut (ms) { 
   return new Promise(function(resolve,reject) { 
	    return setTimeout(resolve,ms,"done");
	}) 
} 
timeOut(3000).then( function(value){ 
   console.log(value);
})
```

timeOut方法返回一个promise实例，表示一段时间以后才会发生的结果，过了指定的时间（ms）以后，promise实例的状态变为resolved，就会触发then方法绑定的回调函数

Promise新建后就会立即执行

```
let promise = new Promise(function(resolve, reject) { 
   console.log('Promise'); resolve();
}); 
promise.then(function() { 
   console.log('resolved.');
}); 
console.log('Hi!');

// Promise 
// Hi! 
// resolved
```
Promise 新建后立即执行，所以首先输出的是Promise。然后，then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行，所以resolved最后输出。

## 实用技巧 用 promise 实现 sleep 功能
```
 await new Promise(resolve => setTimeout(() => resolve(), 3000));
```