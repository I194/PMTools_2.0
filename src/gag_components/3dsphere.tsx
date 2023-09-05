import React, {createElement as e, useState, useEffect, useRef} from 'react';
import {
    GeoVdek,
    getRandomfloat,
    NormalizeV,
    RotateAroundV,
    angle_between_v,
    PlotCircle,
    make_coords,
    get_perp,
    centering,
    poly_contour,
    zone_square
    } from "./gag_functions";

import { createScene } from './ThreejsScene';

export function Threedsphere() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current) {
        createScene(containerRef.current);
      }
    }, [containerRef]);

    return <div ref={containerRef} />;

}
