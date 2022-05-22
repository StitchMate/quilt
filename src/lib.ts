import { Result } from "@badrap/result";

const loadModule = async (
  moduleName: string,
  exportName: string
): Promise<Result<Module>> => {
  try {
    await __webpack_init_sharing__("default");
  } catch (e) {
    return Result.err(new Error("We failed to initialize the sharing scope(s)"));
  }
  const container: ModuleContainer | undefined = (window as any)[moduleName];

  if (!container || !Object.keys(container).includes("init")) {
    return Result.err(
      new Error(`Failed to find module container loaded under specified module name: ${moduleName}`)
    );
  }
  await container.init(__webpack_share_scopes__.default);
  try {
    const factory = await container.get(exportName);
    const mod = factory();
    return Result.ok(mod);
  } catch (e) {
    return Result.err(
      new Error(
        `Could not find module of name ${exportName} within the loaded federated container`
      )
    );
  }
};

export {
    loadModule
}


