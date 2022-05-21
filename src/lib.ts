import { Result } from "@badrap/result";

const loadComponent = async (
  scope: string,
  module: string
): Promise<Result<Module>> => {
  try {
    await __webpack_init_sharing__("default");
  } catch (e) {
    return Result.err(new Error("We failed to initialize the sharing scopes"));
  }
  const container: ModuleContainer | undefined = (window as any)[scope];

  if (!container) {
    return Result.err(
      new Error("Failed to find module container loaded under specified scope")
    );
  }
  await container.init(__webpack_share_scopes__.default);
  try {
    const factory = await container.get(module);
    const mod = factory();
    return Result.ok(mod);
  } catch (e) {
    return Result.err(
      new Error(
        "Could not find module of that name within the loaded module container"
      )
    );
  }
};

export {
    loadComponent
}


