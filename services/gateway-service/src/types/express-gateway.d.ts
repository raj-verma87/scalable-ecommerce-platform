declare module 'express-gateway' {
  const gateway: () => {
    load: (configPath: string) => ReturnType<typeof gateway>;
    run: () => void;
  };
  export default gateway;
}
