import React, { useEffect, useRef, useContext, useState } from "react";
import classNames from "classnames";
import {
    Vector2,
    SRGBColorSpace,
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    DirectionalLight,
    AmbientLight,
    MeshPhongMaterial,
    SphereGeometry,
    Mesh,
} from "three";
import { animate } from "popmotion";
import innerHeight from "ios-inner-height";
import vertShader from "./sphereVertShader";
import fragShader from "./sphereFragShader";
import { Transition } from "react-transition-group";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useInViewport } from "../../hooks/useInViewport";
import { reflow } from "../../utils/transition";
import { media, rgbToThreeColor } from "../../utils/style";
import { cleanScene, removeLights, cleanRenderer } from "../../utils/three";
import "./DisplacementSphere.css";
import { ThemeContext } from "../theme/ThemeProvider";

const AnimatedSphere = ({ onUnavailable, ...props }) => {
    const { theme } = useContext(ThemeContext);
    const rgbBackground = theme === "light" ? "250 250 250" : "17 17 17";
    const width = useRef(window.innerWidth);
    const height = useRef(window.innerHeight);
    const start = useRef(Date.now());
    const canvasRef = useRef();
    const mouse = useRef();
    const renderer = useRef();
    const camera = useRef();
    const scene = useRef();
    const lights = useRef();
    const uniforms = useRef();
    const material = useRef();
    const geometry = useRef();
    const sphere = useRef();
    const tweenRef = useRef([]);
    const rotationX = useRef(0);
    const rotationY = useRef(0);
    const isInViewport = useInViewport(canvasRef);

    useEffect(() => {
        mouse.current = new Vector2(0.8, 0.5);
        const canvas = canvasRef.current;
        try {
            const context = canvas.getContext("webgl2", { powerPreference: "high-performance" });
            if (!context) {
                onUnavailable(true);
                return;
            }
            renderer.current = new WebGLRenderer({
                canvas,
                context,
                powerPreference: "high-performance",
            });
        } catch {
            onUnavailable(true);
            return;
        }
        const handleContextLost = (event) => {
            event.preventDefault();
            onUnavailable(true);
        };
        canvas.addEventListener("webglcontextlost", handleContextLost);
        renderer.current.setSize(width.current, height.current);
        renderer.current.setPixelRatio(1);
        renderer.current.outputColorSpace = SRGBColorSpace;

        camera.current = new PerspectiveCamera(
            55,
            width.current / height.current,
            0.1,
            200
        );
        camera.current.position.z = 52;

        scene.current = new Scene();

        material.current = new MeshPhongMaterial();
        material.current.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 };
            uniforms.current = shader.uniforms;
            shader.vertexShader = vertShader(shader.vertexShader);
            shader.fragmentShader = fragShader(shader.fragmentShader);
        };

        geometry.current = new SphereGeometry(32, 128, 128);

        sphere.current = new Mesh(geometry.current, material.current);
        sphere.current.position.z = 0;
        sphere.current.modifier = Math.random();
        rotationX.current = sphere.current.rotation.x;
        rotationY.current = sphere.current.rotation.y;
        scene.current.add(sphere.current);

        return () => {
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            cleanScene(scene.current);
            cleanRenderer(renderer.current);
        };
    }, []);

    useEffect(() => {
        if (!renderer.current) return;
        const dirLight = new DirectionalLight(
            rgbToThreeColor("250 250 250"),
            0.6 * Math.PI
        );
        const ambientLight = new AmbientLight(
            rgbToThreeColor("250 250 250"),
            (theme === "light" ? 0.8 : 0.1) * Math.PI
        );

        dirLight.position.z = 200;
        dirLight.position.x = 100;
        dirLight.position.y = 100;

        lights.current = [dirLight, ambientLight];
        scene.current.background = rgbToThreeColor(rgbBackground).convertSRGBToLinear();
        lights.current.forEach((light) => scene.current.add(light));

        return () => {
            removeLights(lights.current);
        };
    }, [rgbBackground, theme]);

    useEffect(() => {
        if (!renderer.current) return;
        const handleResize = () => {
            const canvasHeight = innerHeight();
            const windowWidth = window.innerWidth;
            const fullHeight = canvasHeight + canvasHeight * 0.3;
            canvasRef.current.style.height = fullHeight;
            renderer.current.setSize(windowWidth, fullHeight);
            camera.current.aspect = windowWidth / fullHeight;
            camera.current.updateProjectionMatrix();

            if (windowWidth <= media.mobile) {
                sphere.current.position.x = 14;
                sphere.current.position.y = 10;
            } else if (windowWidth <= media.tablet) {
                sphere.current.position.x = 18;
                sphere.current.position.y = 14;
            } else {
                sphere.current.position.x = 22;
                sphere.current.position.y = 16;
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (!renderer.current) return;
        const stopTweens = () => {
            tweenRef.current.forEach((tween) => tween.stop());
            tweenRef.current = [];
        };

        const onMouseMove = (event) => {
            const { rotation } = sphere.current;

            const position = {
                x: event.clientX / window.innerWidth,
                y: event.clientY / window.innerHeight,
            };

            stopTweens();

            tweenRef.current = [
                animate({
                    type: "spring",
                    from: rotationX.current,
                    to: position.y / 2,
                    stiffness: 30,
                    damping: 20,
                    mass: 2,
                    restSpeed: 0.0001,
                    onUpdate: (latest) => {
                        rotationX.current = latest;
                        rotation.set(
                            rotationX.current,
                            rotationY.current,
                            sphere.current.rotation.z
                        );
                    },
                }),
                animate({
                    type: "spring",
                    from: rotationY.current,
                    to: position.x / 2,
                    stiffness: 30,
                    damping: 20,
                    mass: 2,
                    restSpeed: 0.0001,
                    onUpdate: (latest) => {
                        rotationY.current = latest;
                        rotation.set(
                            rotationX.current,
                            rotationY.current,
                            sphere.current.rotation.z
                        );
                    },
                }),
            ];
        };

        if (isInViewport) {
            window.addEventListener("mousemove", onMouseMove);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            stopTweens();
        };
    }, [isInViewport]);

    useEffect(() => {
        if (!renderer.current) return;
        let animation;

        const animate = () => {
            animation = requestAnimationFrame(animate);

            if (uniforms.current !== undefined) {
                uniforms.current.time.value =
                    0.00005 * (Date.now() - start.current);
            }

            sphere.current.rotation.z += 0.001;
            renderer.current.render(scene.current, camera.current);
        };

        if (isInViewport) {
            animate();
        } else {
            renderer.current.render(scene.current, camera.current);
        }

        return () => {
            cancelAnimationFrame(animation);
        };
    }, [isInViewport]);

    return (
        <Transition
            appear
            in
            nodeRef={canvasRef}
            onEnter={() => reflow(canvasRef.current)}
            timeout={3000}
        >
            {(status) => (
                <canvas
                    aria-hidden
                    className={classNames(
                        "displacement-sphere",
                        `displacement-sphere--${status}`
                    )}
                    ref={canvasRef}
                    {...props}
                />
            )}
        </Transition>
    );
};

const DisplacementSphere = (props) => {
    const { theme } = useContext(ThemeContext);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [unavailable, setUnavailable] = useState(false);

    if (prefersReducedMotion || unavailable) {
        return (
            <picture aria-hidden="true">
                <source
                    media="(max-width: 900px)"
                    srcSet={`/backgrounds/sphere-mobile-${theme}.webp`}
                />
                <img
                    key={theme}
                    className="displacement-sphere displacement-sphere--fallback"
                    src={`/backgrounds/sphere-desktop-${theme}.webp`}
                    alt=""
                    onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                />
            </picture>
        );
    }

    return <AnimatedSphere {...props} onUnavailable={setUnavailable} />;
};

export default DisplacementSphere;
