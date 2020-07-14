#### Promise A+ 规范

##### 定义我们的YPromise的，采用ES6写法

```
var p = new Promise((resolve,reject)=>{

})
```

##### 分析

    1.promise传入的参数必须为函数
    2.promise传入的参数为函数且该函数内为2个函数(resolve,reject)为promise内处理函数

#### 代码

```
class YPromise {
    constructor(exector) {
        this.value = null;
        this.status = YPromise.PENDING;
        this.initBind();
        this.init(exector);
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    init(exector) {
        if (typeof exector !== 'function') {
            throw new TypeError('an argument must be function');
        }
        exector(this.resolve, this.reject);
    }

    resolve() {

    }

    reject() {

    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';
```

#####  分析

    1.Promise运行时 调用then方法时 传递的参数判断

####   代码

```
class YPromise {
    constructor(exector) {
        this.value = null;
        this.reason = null;
        this.status = YPromise.PENDING;
        this.initBind();
        this.init(exector);
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    init(exector) {
        if (typeof exector !== 'function') {
            throw new TypeError('an argument must be function');
        }
        exector(this.resolve, this.reject);
    }

    resolve(value) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.FULFILLED;
            this.value = value;
        }
    }

    reject(reason) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.REJECTED;
            this.reason = reason;
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => reason;

        if (this.status === YPromise.FULFILLED) {
            onFulfilled(this.value);
        }

        if (this.status === YPromise.REJECTED) {
            onRejected(this.reason);
        }
    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';
```

##### 分析

    1.Promise对象的then方法是异步运行方式
    2.同时初始化执行时，resolve可能包含在异步函数中，这可能导致代码还没有运行，因为当前Promise状态还是pending状态

##### 代码

```
class YPromise {
    constructor(exector) {
        this.value = null;
        this.reason = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        this.status = YPromise.PENDING;
        this.initBind();
        this.init(exector);
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    init(exector) {
        if (typeof exector !== 'function') {
            throw new TypeError('an argument must be function');
        }
        exector(this.resolve, this.reject);
    }

    resolve(value) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.FULFILLED;
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => {
                callback(this.value);
            })
        }
    }

    reject(reason) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.REJECTED;
            this.reason = reason;
            this.onRejectedCallbacks.forEach(callback => {
                callback(this.reason);
            })
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => reason;

        if (this.status === YPromise.FULFILLED) {
            setTimeout(() => {
                onFulfilled(this.value);
            });
        }

        if (this.status === YPromise.REJECTED) {
            setTimeout(() => {
                onRejected(this.reason);
            })
        }

        if (this.status === YPromise.PENDING) {
            this.onFulfilledCallbacks.push(value => {
                setTimeout(() => {
                    onFulfilled(value);
                })
            })

            this.onRejectedCallbacks.push(reason => {
                setTimeout(() => {
                    onRejected(reason);
                })
            })
        }
    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';
```


##### 定义Promise的链式调用

    1.可以频繁的调用then方法进行链式调用

##### 代码

```
class YPromise {
    constructor(exector) {
        this.value = null;
        this.reason = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        this.status = YPromise.PENDING;
        this.initBind();
        this.init(exector);
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    init(exector) {
        if (typeof exector !== 'function') {
            throw new TypeError('an argument must be function');
        }
        exector(this.resolve, this.reject);
    }

    resolve(value) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.FULFILLED;
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => {
                callback(this.value);
            })
        }
    }

    reject(reason) {
        if (this.status === YPromise.PENDING) {
            this.status = YPromise.REJECTED;
            this.reason = reason;
            this.onRejectedCallbacks.forEach(callback => {
                callback(this.reason);
            })
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => reason;

        let promise2 = new YPromise((resolve, reject) => {
            if (this.status === YPromise.FULFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value);
                        resolve(x);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            if (this.status === YPromise.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        resolve(x);
                    } catch (error) {
                        reject(error);
                    }
                })
            }

            if (this.status === YPromise.PENDING) {
                this.onFulfilledCallbacks.push(value => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(value);
                            resolve(x);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })

                this.onRejectedCallbacks.push(reason => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(reason);
                            resolve(x);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
            }
        })
    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';
```

##### 细节处理 最终代码

    1.避免调用循环调用本身
    2.如果返回值是promise对象时，则必须等待该promise结束才能进行下一步操作