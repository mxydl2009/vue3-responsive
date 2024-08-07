/**
 * @file
 * 任务队列的操作和刷新
 *
 * @module queue
 *
 */

let isFlushing = false;
const jobQueue = new Set();

/**
 * 入队, 调度任务（缓存到微任务队列中）执行
 * @param {function} job 要调度执行的函数
 */
export function enqueue(job) {
  jobQueue.add(job);
  if (!isFlushing) {
    flushJob();
  }
}

/**
 * 刷新队列
 * 在微任务中，将队列中的函数依次执行, 清理队列
 */
export function flushJob() {
  isFlushing = true;
  Promise.resolve()
    .then(() => {
      jobQueue.forEach((job) => {
        job();
      });
    })
    .finally(() => {
      isFlushing = false;
      jobQueue.clear();
    });
}
