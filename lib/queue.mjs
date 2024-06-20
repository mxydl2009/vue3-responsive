let isFlushing = false;
const jobQueue = new Set();

export const enqueue = (job) => {
  jobQueue.add(job);
};

export const flushJob = () => {
  isFlushing = true;
  Promise.resolve()
    .then(() => {
      jobQueue.forEach((job) => {
        job();
      });
    })
    .finally(() => {
      isFlushing = false;
    });
};
