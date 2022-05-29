/** @jsxImportSource atomico */
/** @jsx h as _jsx, css as _css  */
import { c, Props, useEffect, useRef, useState } from "atomico";
import { useRender } from "@atomico/hooks/use-render";
import { useSlot } from "@atomico/hooks/use-slot";
import { loadModule, loadFile } from "./lib";

function fedContainer({
  moduleName,
  url,
  integrity,
  exportName,
  fn,
  data,
}: Props<typeof fedContainer>) {
  const ref = useRef();
  const slotContent = useSlot(ref);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadedModule, setLoadedModule] = useState({});

  useEffect(() => {
    let missingProps = false;
    if (
      moduleName?.length == 0 ||
      url?.length == 0 ||
      exportName?.length == 0
    ) {
      setReady(false);
      setFailed(true);
      missingProps = true;
      console.error(
        "Please ensure the following properties are defined with a non-null value: module-name, url, export-name"
      );
    }
    let federate = async (missingProps: boolean) => {
      if (
        !ready &&
        slotContent &&
        (slotContent.length == 0 ||
          (slotContent[0] as Element).innerHTML.length == 0) &&
        !missingProps
      ) {
        setReady(false);
        setFailed(false);

        loadFile(
          url,
          moduleName,
          integrity,
          () => {
            setReady(true);
            setFailed(false);
          },
          (onerror = () => {
            setReady(false);
            setFailed(true);
          })
        );
      } else if (
        ready &&
        slotContent &&
        (slotContent.length == 0 ||
          (slotContent[0] as Element).innerHTML.length == 0) &&
        !missingProps
      ) {
        let mod = await loadModule(moduleName || "", exportName || "");

        if (mod.isErr) {
          setFailed(true);
          console.error(mod.error);
        } else {
          let m = mod.unwrap();

          setLoadedModule(Object.assign({}, m));

          if (fn && !Object.keys(m).includes(fn)) {
            console.error(
              `A function with name ${fn} not found in the federated module`
            );
            setFailed(true);
            return;
          }

          if (fn) {
            m[fn](moduleName, data);
          }
        }

        let element = document.getElementById(`${moduleName}_mod` || "");
        document.head.removeChild(element as Node);

        return () => {
          document.head.removeChild(element as Node);
        };
      }
    };

    federate(missingProps);
  }, [url, module, moduleName, ref, ready]);

  useEffect(
    () => () => {
      (window as any)[moduleName || ""] = undefined;
    },
    []
  );

  useRender(() => <div slot="internal" id={moduleName}></div>);

  return (
    <host shadowDom {...loadedModule}>
      {failed ? <slot name="failure"></slot> : null}
      {!ready && !failed ? <slot name="loading"></slot> : null}
      <slot name="internal" ref={ref}></slot>
    </host>
  );
}

fedContainer.props = {
  moduleName: {
    type: String,
    value: "",
  },
  url: {
    type: String,
    value: "",
  },
  data: {
    type: Object,
  },
  exportName: {
    type: String,
    value: "",
  },
  fn: {
    type: String,
  },
  integrity: {
    type: String,
  },
  class: {
    type: String,
  },
};

export const FedContainer = c(fedContainer);

customElements.define("seam-quilt", FedContainer);
