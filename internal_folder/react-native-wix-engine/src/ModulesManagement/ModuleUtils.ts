interface Module {
  //TODO - this should be an actual type!
  prefix(): string;
  [key: string]: () => any;
}

type Consumer = {
  generator?: string;
  value?: any;
};

type ConsumerInfo = Consumer & {module: Module};

export type ConsumedServices = {[key: string]: ConsumerInfo[]};

export function getServiceConsumers(
  consumedServices: ConsumedServices,
  serviceName: string,
) {
  const consumers: {[key: string]: any} = {};
  const consumersInfo = consumedServices[serviceName];

  if (consumersInfo) {
    for (let i = 0; i < consumersInfo.length; i++) {
      const info = consumersInfo[i];
      const {module, generator} = info;
      if (info.value) {
        consumers[module.prefix()] = info.value;
      } else {
        try {
          info.value = module[generator!]();
          consumers[module.prefix()] = info.value;
        } catch (e) {
          //FATAL should not happen in production
          console.warn(
            `cannot run generator for service ${serviceName} of module ${module.prefix()}`,
            e,
          );
        }
      }
    }
  }

  return consumers;
}
