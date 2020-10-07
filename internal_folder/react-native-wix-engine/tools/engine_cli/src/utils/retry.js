async function retry(options, func) {
  if (typeof options === 'function') {
    func = options;
    options = {};
  }

  const {retries, interval} = options;

  let currentRetry = 0;
  while (currentRetry++ < retries) {
    try {
      return await func(currentRetry);
    } catch (e) {
      if (currentRetry === retries) {
        throw e;
      } else {
        const sleep = currentRetry * interval;
        await new Promise((accept) => setTimeout(accept, sleep));
      }
    }
  }
}

module.exports = retry;
