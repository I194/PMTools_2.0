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
    lambertMass,
    points_dist_2d
    } from "./gag_functions";


export function Zoomed_lambert_graph(lambert_zoom_props:{
                                                            center_zone: number[],
                                                            dir_list: number[][],
                                                            angle_list: number[],
                                                            grid_points: number[][],
                                                            points_numb: number
                                                            sred_dir: number[],
                                                            alpha95: number,
                                                            isvis: boolean,
                                                            isvisgrid: boolean,
                                                            polygonPoints: string
                                                        }) {

    var center_zone = lambert_zoom_props.center_zone;
    var dir_list = lambert_zoom_props.dir_list;
    var angle_list = lambert_zoom_props.angle_list;
    var lambert_grid_points = lambert_zoom_props.grid_points;
    var points_numb = lambert_zoom_props.points_numb;
    var lamb_sred_dir = lambert_zoom_props.sred_dir;
    var alpha95 = lambert_zoom_props.alpha95;
    var lambert_isvis = lambert_zoom_props.isvis;
    var grid_isvis = lambert_zoom_props.isvisgrid;
    var lambert_polygonPoints = lambert_zoom_props.polygonPoints;

    var plot_point_numb = 170;
    var circles_r = 0.0025;
    var grid_r = 0.0015;
    var grid_color = '#16732f';
    var center_zone_r = 0.003;
    var center_zone_color = '#4054E7';
    var my_view_box = "-0.2 -0.2 0.4 0.4";
    var poly_color = "#AAE1BF";



    //-----------------------------------------------------------------
    // making center zone for drawing on lambert svg
    //-----------------------------------------------------------------

    var rot_center_zone = convertToLambert(center_zone, lamb_sred_dir);

    var lambert_center_zone = e('circle',
                            {

                                r: center_zone_r,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                fill: center_zone_color,

                            }, ''
                        );

    //-----------------------------------------------------------------
    // add coords of circles around paleo dirs for lambert svg
    //-----------------------------------------------------------------


    var max_y = 1000000;
    var min_y = 1000000;
    var max_x = 1000000;
    var min_x = 1000000;



    var lambert_circles = [];

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = lambertMass(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);

        for ( var j = 0; j < dir_circle.length; j ++ )
        {
            if (max_x != 1000000 && min_x != 1000000 && max_y != 1000000 && min_y != 1000000)
            {
                if (dir_circle[j][0] > max_x)
                {
                    max_x = dir_circle[j][0];
                }

                if (dir_circle[j][0] < min_x)
                {
                    min_x = dir_circle[j][0];
                }

                if (dir_circle[j][1] > max_y)
                {
                    max_y = dir_circle[j][1];
                }

                if (dir_circle[j][1] < min_y)
                {
                    min_y = dir_circle[j][1];
                }
            }
            else {
                min_x = dir_circle[j][0];
                max_x = dir_circle[j][0];
                min_y = dir_circle[j][1];
                max_y = dir_circle[j][1];

            }
        }
    }

    var circles_r = (max_y - min_y) / 400;
    grid_r = (max_y - min_y) / 400;

    for ( var i = 0; i < dir_list.length; i ++ ) {

        var dir_circle = lambertMass(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);

        for ( var j = 0; j < dir_circle.length; j ++ )
        {
            lambert_circles.push(
                                    e('circle',
                                        {
                                            r: circles_r,
                                            cx: String(dir_circle[j][0]),
                                            cy: String(dir_circle[j][1]),
                                            fill: "black",
                                        }, ''
                                    )
                                );
        }
    }

    var my_view_box = String(min_x) + " " + String(min_y) + " " + String(max_x - min_x) + " " + String(max_y - min_y);

    //     "-0.2 -0.2 0.4 0.4";

    //-----------------------------------------------------------------
    // making grid on left svg
    //-----------------------------------------------------------------

    var zgp1 = [];
        for (var i = 0; i < lambert_grid_points.length; i++)
        {
            zgp1.push(
                RotateAroundV(
                    lambert_grid_points[i],
                    get_perp([0, 0, 1], lamb_sred_dir),
                    -angle_between_v([0, 0, 1], lamb_sred_dir) * 180 / Math.PI)
                );
        }


    var grid = [];

    for ( let i = 0; i < zgp1.length; i ++ ) {
        grid.push(
            e('circle',
                {
                    r: grid_r,
                    cx: String(zgp1[i][0]),
                    cy: String(zgp1[i][1]),
                    fill: grid_color,
                }, ''
            )
        );
    }

    //-----------------------------------------------------------------
    // making fisher stat
    //-----------------------------------------------------------------

    var fisher_dir = e('circle',
                            {
                                r: 0.0035,
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
    <div key={1227544233}>
      <h5 className="my_text">Lambert svg</h5>

      <svg className="svg" key={6534324} viewBox={my_view_box}>

        {lambert_isvis && <polygon points={lambert_polygonPoints} fill={poly_color} />}
        {grid_isvis && grid}
        {lambert_circles}
        {fisher_dir}
        {fish_circle}
        {lambert_center_zone}

      </svg>

    </div>
  );

}