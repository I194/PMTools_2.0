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
                                                            grid_color: string,
                                                            poly_color: string
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




    var poly_color = lambert_zoom_props.poly_color;
    var grid_color = lambert_zoom_props.grid_color;

    var center_zone_color = '#4054E7';
    var plot_point_numb = 170;
    var circles_r = 0.0025;
    var grid_r = 0.0015;
    var center_zone_r = 0.003;




    if (angle_list[0] == 0){
    console.log("clear");
      return (
        <div key={1227544233}>
          <h5 className="my_text">Lambert svg</h5>

          <svg className="svg interface" key={6534324} viewBox={"-1 -1 2 2"}>

          </svg>

        </div>
      );
    }
    //-----------------------------------------------------------------
    // making center zone for drawing on lambert svg
    //-----------------------------------------------------------------
    var my_key = 0;
//--------------------------fix------------------------------------------
// var rot_center_zone = convertToLambert(center_zone, lamb_sred_dir);
    var rot_center_zone = center_zone;
    var lambert_center_zone = e('circle',
                            {
                                key: my_key,
                                //------------------------- fix ---------------------------------------
                                // r: center_zone_r,
                                r: 0.03,
                                cx: String(rot_center_zone[0]),
                                cy: String(rot_center_zone[1]),
                                //------------------------- fix ---------------------------------------
                                // fill: center_zone_color,
                                fill: "red",

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
        //-------------------fix---------mayby dont centering-----------------------
        // var dir_circle = lambertMass(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);
        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);

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
        //-----------------------------fix--------------------------
        // var dir_circle = lambertMass(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);
        var dir_circle = centering(PlotCircle(dir_list[i], angle_list[i], plot_point_numb), lamb_sred_dir);

        for ( var j = 0; j < dir_circle.length; j ++ )
        {
            lambert_circles.push(
                                    e('circle',
                                        {
                                            key: my_key,
                                            //------------------------- fix ---------------------------------------
                                            // r: circles_r,
                                            r: 0.005,
                                            cx: String(dir_circle[j][0]),
                                            cy: String(dir_circle[j][1]),
                                            fill: "black",
                                        }, ''
                                    )
                                );
            my_key += 1;
        }
    }

    //-----------------------------------------------------------------
    // making grid on left svg
    //-----------------------------------------------------------------

    var zgp1 = [];
        for (var i = 0; i < lambert_grid_points.length; i++)
        {
            zgp1.push(lambert_grid_points[i]);
        }

    //-------------------fix-------------------------
    zgp1 = centering(zgp1, lamb_sred_dir);


    var grid = [];

    for ( let i = 0; i < zgp1.length; i ++ ) {
        grid.push(
            e('circle',
                {
                    key: my_key,
                    //------------------------- fix ---------------------------------------
                    // r: grid_r,
                    r: 0.007,
                    cx: String(zgp1[i][0]),
                    cy: String(zgp1[i][1]),
                    fill: grid_color,
                }, ''
            )
        );
        my_key += 1;
    }
    my_key += 1;
    //-----------------------------------------------------------------
    // making fisher stat
    //-----------------------------------------------------------------

    var fisher_dir = e('circle',
                            {
                                key: my_key,
                                r: 0.0035,
                                cx: String(0),
                                cy: String(0),
                                fill: 'red',

                            }, ''
                        );


    my_key += 1;
    //---------------------------------------------------------------------------------------
    // making alpha95 circle
    //---------------------------------------------------------------------------------------

    var fish_circle = [];

    fish_circle.push(
                            e('polyline',
                                {
                                    key: my_key,
                                    points: make_coords(PlotCircle([0, 0, 1], alpha95, 90)),
                                    stroke: "red",
                                    fill: 'none',
                                    strokeWidth: "0.0016px",

                                    strokeDasharray: "0.01px, 0.003px",
                                }, ''
                            )
                        );

    my_key += 1;
    //---------------------------------------------------------------------------------------
    // rumbs
    //---------------------------------------------------------------------------------------

    var rumbs = e('circle',
            {
                key: my_key,
                r: max_y * 1.3,
                cx: String(0),
                cy: String(0),
                fill: "none",
                stroke: "grey", 
                strokeWidth: "0.0016px",
                strokeDasharray: "0.06px, 0.012px"

            }, ''
        );

    my_key += 1;

    if (max_x < -1 * min_x) {var max_x = -min_x}
    if (max_y < -1 * min_y) {var max_y = -min_y}




    var my_view_box:string;
    var rumb_font_size:number;
    var my_max:number;

    if (max_x > max_y){
        rumb_font_size = max_x / 10;
        my_max = max_x;

        my_view_box = String(-max_x - 2 * rumb_font_size) + " ";
        my_view_box += String(-max_x - 2 * rumb_font_size) + " ";
        my_view_box += String(max_x * 2 + 4 * rumb_font_size) + " ";
        my_view_box += String(max_x * 2 + 4 * rumb_font_size);

    }
    else{
        rumb_font_size = max_y / 10;
        my_max = max_y;
        
        my_view_box = String(-max_y - 2 * rumb_font_size) + " ";
        my_view_box += String(-max_y - 2 * rumb_font_size) + " ";
        my_view_box += String(max_y * 2 + 4 * rumb_font_size) + " "; 
        my_view_box += String(max_y * 2 + 4 * rumb_font_size);


    
    }
    //---------------------------------------------------------------------------------------
    // degree grid
    //---------------------------------------------------------------------------------------
    
    var coords = [];

    var point = [1, 0, 0];

    
    var mer_numb = 18;
    for ( var i = 0; i < mer_numb; i ++ ) {
        point = RotateAroundV(point, [0, 1, 0], 30 - 10 * mer_numb / 9);
        var meridian = centering(PlotCircle(point, 90, 90), lamb_sred_dir);
        coords.push(make_coords(meridian));
    }

    var par_numb = 18;
    for ( var i = 0; i < par_numb; i ++ ) {
        var paralel = centering(PlotCircle([0, 1, 0], i * (30 - 10 * mer_numb / 9), 90), lamb_sred_dir);
        coords.push(make_coords(paralel));
    }

    paralel = PlotCircle([0, 0, 1], 90, 90);
    coords.push(make_coords(paralel));

    var center_degree_grid = [];
    for ( let i = 0; i < coords.length; i ++ ) {
        center_degree_grid.push(
            e('polyline',
                {
                    key: my_key,
                    points: coords[i],
                    stroke: "grey",
                    fill: 'none',
                    //------------------------- fix ---------------------------------------
                    // strokeWidth:"0.0005px"
                    strokeWidth:"0.01px"
                }, ''
            )
        );
        my_key += 1;
    }

    //-------------------------------------------------------------------------------
    //--------rot_center_zone twice????????!!!!!!!!--------fix---------------------
    //   var rot_center_zone = convertToLambert(center_zone, lamb_sred_dir);
  var rot_center_zone = center_zone;


  var calc_circ_points = 720 * 8;
  var input: [number, number][] = [];
  var circ_p = [];

  for ( var i = 0; i < dir_list.length; i ++ )
  {
      
    //-------------------fix---------------------
    // var b = lambertMass(PlotCircle(dir_list[i], angle_list[i], calc_circ_points), lamb_sred_dir);
    var b = PlotCircle(dir_list[i], angle_list[i], calc_circ_points);

      for (var j = 0; j < b.length; j++){
          circ_p.push(b[j]);
      }
  }

  for ( let i = 0; i < circ_p.length; i ++ )
  {
      input.push([circ_p[i][0], circ_p[i][1]]);
  }

  var poly_points2d = poly_contour(input, [rot_center_zone[0], rot_center_zone[1]]);
  var poly_points3d = [];

  for ( let i = 0; i < poly_points2d.length; i ++ )
  {
      poly_points3d.push([poly_points2d[i][0], poly_points2d[i][1], 1 ]);
  }

  const polygonPoints = make_coords(poly_points3d);

  var max_rad = -1;
  for ( let i = 0; i < input.length; i ++ )
  {
      if (points_dist_2d(rot_center_zone, input[i]) > max_rad){max_rad = points_dist_2d(rot_center_zone, input[i]);}
  }



  //------------------------------------------- fix ---------------------------------------
  my_view_box = '-1 -1 2 2';
  //-------------------------------fix-----------------------
  return (
    <div key={1227544233}>
      {/* <h5 className="my_text">Lambert svg</h5> */}

      <svg className="svg graph_interface" key={6534324} viewBox={my_view_box}>

        {/* {rumbs} */}

        {center_degree_grid}
        {/* {lambert_isvis && <polygon points={polygonPoints} fill={poly_color} />} */}
        {grid_isvis && grid}
        {lambert_circles}
        {/* {fisher_dir} */}
        {/* {fish_circle} */}
        {/* {lambert_center_zone} */}

        {/* <text x={my_max + rumb_font_size} y={0} textAnchor="middle" fontSize={String(rumb_font_size)} fill="black">
            {"E"}
        </text>
        <text x={-my_max - rumb_font_size} y={0} textAnchor="middle" fontSize={String(rumb_font_size)} fill="black">
            {"W"}
        </text>
        <text x={0} y={my_max + rumb_font_size} textAnchor="middle" fontSize={String(rumb_font_size)} fill="black">
            {"S"}
        </text>
        <text x={0} y={-my_max - rumb_font_size} textAnchor="middle" fontSize={String(rumb_font_size)} fill="black">
            {"N"}
        </text> */}

      </svg>

    </div>
  );

}
