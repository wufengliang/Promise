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
                        YPromise.resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            if (this.status === YPromise.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        YPromise.resolvePromise(promise2, x, resolve, reject);
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
                            YPromise.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })

                this.onRejectedCallbacks.push(reason => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(reason);
                            YPromise.resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
            }
        })
        return promise2;
    }
}

/**
 * 定义YPromise几个状态
 */
YPromise.PENDING = 'pending';
YPromise.FULFILLED = 'fulfilled';
YPromise.REJECTED = 'rejected';
YPromise.resolvePromise = (promise2, x, resolve, reject) => {
    if (x === promise2) {
        reject(new TypeError('Chaining cycle detected for promise'));
    }
    let called = false;
    if (x instanceof YPromise) {
        //  x是Promise实例
        x.then(value => {
            YPromise.resolvePromise(promise2, value, resolve, reject);
        })
    } else if ((x !== null && typeof x === 'object') || typeof x === 'function') {
        //  x是一个不为null的数据类型 或者 x为函数
        try {
            const then = x.then;
            then.call(x, value => {
                if (called) return;
                called = true;
                YPromise.resolvePromise(promise2, value, resolve, reject);
            })
        } catch (error) {
            reject(error)
        }
    } else {
        if (called) return;
        called = true;
        resolve(x);
    }
}

YPromise.resolve = value => {
    if (value instanceof YPromise) {
        return value;
    }

    if (value === null) {
        return null;
    }

    if ((value !== null && typeof value === 'object') || typeof value === 'function') {
        try {
            const then = value.then;
            if (typeof then === 'function') {
                return new YPromise(then.call(value));
            }
        } catch (error) {
            return new YPromise((resolve, reject) => {
                reject(error);
            })
        }
    }
    return value;
}

YPromise.all = promise => {
    return new YPromise((resolve, reject) => {
        let array = [];
        promise.forEach((p, i) => {
            p.then(d => {
                array[i] = d;
            }, err => {
                reject(err);
                return;
            })
        })
        resolve(array);
    })
}

YPromise.prototype.finally = (func) => {
    return this.then(value => {
        return YPromise.resolve(func.then(() => value))
    }, err => {
        return YPromise.resolve(func.then(() => {
            throw err
        }))
    })
}