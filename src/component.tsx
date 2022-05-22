/** @jsxImportSource atomico */
/** @jsx h as _jsx, css as _css  */
import { c, Props, useEffect, useRef, useState } from "atomico";
import { useRender } from "@atomico/hooks/use-render";
import { useSlot } from "@atomico/hooks/use-slot";
import { loadModule } from "./lib";

function fedContainer({
  scope,
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
    if (scope?.length == 0 || url?.length == 0 || exportName?.length == 0) {
      setReady(false);
      setFailed(true);
      missingProps = true;
      console.error(
        "Please ensure the following properties are defined with a non-null value: scope, url, export-name"
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
        const element = document.createElement("script");

        element.src = url || "";
        element.type = "text/javascript";
        element.async = true;
        element.id = `${scope}_mod` || "";

        if (integrity) {
          element.integrity = integrity;
          element.crossOrigin = "anonymous";
        }

        setReady(false);
        setFailed(false);

        element.onload = () => {
          setReady(true);
          setFailed(false);
        };

        element.onerror = () => {
          setReady(false);
          setFailed(true);
        };

        document.head.appendChild(element);
      } else if (
        ready &&
        slotContent &&
        (slotContent.length == 0 ||
          (slotContent[0] as Element).innerHTML.length == 0) &&
        !missingProps
      ) {
        let mod = await loadModule(scope || "", exportName || "");

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
            m[fn](scope, data);
          }
        }

        let element = document.getElementById(`${scope}_mod` || "");
        document.head.removeChild(element as Node);

        return () => {
          document.head.removeChild(element as Node);
        };
      }
    };

    federate(missingProps);
  }, [url, module, scope, ref, ready]);

  useEffect(
    () => () => {
      (window as any)[scope || ""] = undefined;
    },
    []
  );

  useRender(() => <div slot="internal" id={scope}></div>);

  return (
    <host shadowDom {...loadedModule}>
      {failed ? <slot name="failure"></slot> : null}
      {!ready && !failed ? <slot name="loading"></slot> : null}
      <slot name="internal" ref={ref}></slot>
    </host>
  );
}

fedContainer.props = {
  scope: {
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
