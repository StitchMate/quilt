/** @jsxImportSource atomico */
/** @jsx h as _jsx, css as _css  */
import { c, css, Props, useEffect, useRef, useState } from "atomico";
import { useRender } from "@atomico/hooks/use-render";
import { useSlot } from "@atomico/hooks/use-slot";
import { loadComponent } from "./lib";
import styles from "./tailwind.css";

function fedContainer({scope, url, module, fn, module_id, data}: Props<typeof fedContainer>) {
    const ref = useRef();
    const slotContent = useSlot(ref);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let missingProps = false;
        if (scope?.length == 0 || url?.length == 0 || module?.length == 0 || fn?.length == 0 || module_id?.length == 0) {
            setReady(false);
            setFailed(true);
            missingProps = true;
            console.error("Please ensure the following properties are defined with a non-null value: scope, url, module, fn, module_id");
        }
        let federate = (async (missingProps: boolean) => {
            if (!ready && slotContent && (slotContent.length == 0 || (slotContent[0] as Element).innerHTML.length == 0) && !missingProps) {
                const element = document.createElement("script");

                element.src = url || "";
                element.type = "text/javascript";
                element.async = true;
                element.id = `${module_id}_mod` || "";

                setReady(false);
                setFailed(false);

                element.onload = () => {
                    setReady(true);
                    setFailed(false);
                }

                element.onerror = () => {
                    setReady(false);
                    setFailed(true);
                }

                document.head.appendChild(element);
            } else if (ready && slotContent && (slotContent.length == 0 || (slotContent[0] as Element).innerHTML.length == 0) && !missingProps) {
                let mod = await loadComponent(scope || "", module || "");

                if (mod.isErr) {
                    console.error(mod.error);
                } else {
                    let m = mod.unwrap();
                    
                    m[fn](module_id, data);
                }

                let element = document.getElementById(`${module_id}_mod` || "");
                document.head.removeChild(element as Node);

                return () => {
                    document.head.removeChild(element as Node);
                }
            }
        });

        federate(missingProps);                        
    }, [ url, module_id, module, scope, ref, ready]);

    useEffect(() => () => {
        (window as any)[scope || ""] = undefined;
    }, []);

    useRender(() => <div slot="internal" id={module_id}></div>)

    return (
        <host shadowDom>
            {failed ? <div class="container">
                <div>icon</div>
                <p>Something went wrong, please try again later.</p>
            </div>: null}
            {!ready && !failed ? <div class="container">
                <div>icon</div>
                <p>Loading...</p>
            </div>: null}
            <slot name="internal" ref={ref}></slot>
        </host>
    )
}

fedContainer.props = {
    scope: {
        type: String,
        value: ""
    },
    url: {
        type: String,
        value: ""
    },
    data: {
        type: Object,
    },
    module: {
        type: String,
        value: ""
    },
    module_id: {
        type: String,
        value: ""
    },
    fn: {
        type: String,
        value: "default"
    }
};

fedContainer.styles = [css`${styles}`];

export const FedContainer = c(fedContainer);

customElements.define("seam-fed", FedContainer);