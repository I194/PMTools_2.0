import React, {createElement as e, useState} from 'react';
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
    zone_square,
    convexHull,
    convertToLambert,
    lambertMass
    } from "./gag_functions";


export function Zoomed_lambert_graph(lambert_zoom_props:{
                                                            center_zone: number[],
                                                            dir_list: number[][],
                                                            angle_list: number[],
                                                            grid_points: number[][],
                                                            points_numb: number
                                                            sred_dir: number[],
                                                            alpha95: number
                                                        }) {

    var center_zone = lambert_zoom_props.center_zone;
    var dir_list = lambert_zoom_props.dir_list;
    var angle_list = lambert_zoom_props.angle_list;
    var lambert_grid_points = lambert_zoom_props.grid_points;
    var points_numb = lambert_zoom_props.points_numb;
    var lamb_sred_dir = lambert_zoom_props.sred_dir;
    var alpha95 = lambert_zoom_props.alpha95;


    //-----------------------------------------------------------------
    // making center zone for drawing on lambert svg
    //-----------------------------------------------------------------

    //==========================================================================================================
//     var rot_center_zone = RotateAroundV(center_zone, get_perp([0, 0, 1], lamb_sred_dir), -angle_between_v([0, 0, 1], lamb_sred_dir) * 180 / Math.PI);
    var rot_center_zone = convertToLambert(center_zone, lamb_sred_dir);

    var lambert_center_zone = e('circle',
                            {

                                r: 0.003,
//                                 r: 0.0019,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: '#4054E7',

                            }, ''
                        );

    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for lambert svg
    //-----------------------------------------------------------------

    var plot_point_numb = 90;

    var lambert_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        //==========================================================================================================
        var dir_circle = lambertMass(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);

        for ( var j = 0; j < dir_circle.length; j ++ )
        {
        lambert_circles.push(
                                e('circle',
                                    {
                                        r: 0.0015,
//                                         r: 0.0005,
                                        cx: String(dir_circle[j][0]),
                                        cy: String(dir_circle[j][1]),
                                        fill: "black",
                                    }, ''
                                )
                            );

        }

    }

    //-----------------------------------------------------------------
    // polygon of zone
    //-----------------------------------------------------------------

    var calc_circ_points = 720 * 8;
    var input: [number, number][] = [];
    var circ_p = [];

    for ( var i = 0; i < dir_list.length; i ++ )
    {
        //==========================================================================================================
        var b = lambertMass(PlotCircle(dir_list[i], angle_list[i], calc_circ_points), lamb_sred_dir);

        for (var j = 0; j < b.length; j++){
            circ_p.push(b[j]);
        }
    }

    for ( let i = 0; i < circ_p.length; i ++ )
    {
        input.push([circ_p[i][0], circ_p[i][1]]);
    }

    var poly_points2d = poly_contour(input, [rot_center_zone[0], rot_center_zone[1]], zone_square(lambert_grid_points.length, points_numb));
    var poly_points3d = [];

    for ( let i = 0; i < poly_points2d.length; i ++ )
    {
        poly_points3d.push([poly_points2d[i][0], poly_points2d[i][1], 1 ]);
    }


  const [isVisible, setIsVisible] = useState(true);

  const handleCheckboxChange = () => {
    setIsVisible(!isVisible);
  };

  const polygonPoints = make_coords(poly_points3d);

    //-----------------------------------------------------------------
    // making fisher stat
    //-----------------------------------------------------------------

    var fisher_dir = e('circle',
                            {
                                r: 0.0035,
//                                 r: 0.0025,
                                cx: String(0),
                                cy: String(0),
                                fill: 'red',

                            }, ''
                        );



    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------

    var fish_circle = [];

    fish_circle.push(
                            e('polyline',
                                {
                                    points: make_coords(PlotCircle([0, 0, 1], alpha95, 90)),
                                    stroke: "red",
                                    fill: 'none',
                                    strokeWidth: "0.0016px",
//                                     strokeWidth: "0.001px",
                                    strokeDasharray: "0.01px, 0.003px",
                                }, ''
                            )
                        );

  return (
    <div key={13}>
      <h5 className="my_text">lambert svg</h5>

      <svg className="svg" key={4} viewBox="-0.2 -0.2 0.4 0.4">
        {isVisible && <polygon points={polygonPoints} fill="#AAE1BF" />}
        {lambert_circles}
        {fisher_dir}
        {fish_circle}
        {lambert_center_zone}
      </svg>
      <input type="checkbox" checked={isVisible} onChange={handleCheckboxChange} />
    </div>
  );


}