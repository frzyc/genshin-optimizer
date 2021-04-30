declare module "worker-loader!*" {
    class BuildWorker extends Worker {
        constructor();
    }

    // Uncomment this if you set the `esModule` option to `false`
    // export = WebpackWorker;
    export default BuildWorker;
}
