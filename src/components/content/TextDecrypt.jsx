import React, { useEffect } from "react";
import { useDencrypt } from "use-dencrypt-effect";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const decryptOptions = {
    chars: "-./*!?#%&@$€()[]{}<>~0123456789abcdefghijklmnopqrstuvwxyz",
    interval: 50,
};

const AnimatedText = (props) => {
    const [ result, dencrypt ] = useDencrypt(decryptOptions);

    useEffect(() => {
        const updateText = () => {
            dencrypt(props.text || "");
        };

        const action = setTimeout(updateText, 0);

        return () => clearTimeout(action);
    }, [dencrypt, props.text]);

    return (
        <p>
            {result}
            {" "}
        </p>
    );
};

export const TextDecrypt = (props) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    return prefersReducedMotion ? <p>{props.text}</p> : <AnimatedText {...props} />;
};
