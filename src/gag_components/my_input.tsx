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
    zone_square
    } from "./gag_functions";


export const My_interface: React.FC = () => {
// export function My_interface() {

    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------


    var cmadlist = [7.69, 3.9, 3.18, 2.88,
                    2.71, 2.63, 2.57, 2.54,
                    2.51, 2.48, 2.46, 2.44,
                    2.43, 2.43];
    var camadlist = [6.0, 5.0, 4.63, 4.43,
                    4.31, 4.24, 4.18, 4.14,
                    4.12, 4.11, 4.08, 4.08,
                    4.06, 4.05];


    var max_lon = 95;
    var min_lon = 91;
    var max_lat = 5;
    var min_lat = 1;


    var paleo_data_list = [
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) ),
        GeoVdek( 1, getRandomfloat(min_lat, max_lat), getRandomfloat(min_lon, max_lon) )
        ];



    var dir_list = [];
    var angle_list = [];
    var random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
    var random_angle = getRandomfloat(0, 180);
//     var random_dir = NormalizeV( [12.25332872287876, 0.62710598184995592, 0.7081437582222506] );
//     var random_angle = -38.37150716636394;

    for ( var i = 0; i < 6; i ++ ) {

        paleo_data_list[i] = RotateAroundV(paleo_data_list[i], random_dir, random_angle);

        // this lists will use later
        dir_list.push(NormalizeV(paleo_data_list[i]));
        angle_list.push(cmadlist[8]);
    }


    //-----------------------------------------------------------------------
    // making grid dots
    //-----------------------------------------------------------------------

    var x;
    var y;
    var m;
    var grid_points = [];

    var print_point = 0;
    var print_point = 0;

    var phi = 0.013;
    var points_numb = 1000000;


    for (var i = 0; i < points_numb; i++)
    {
        x = (i * phi - Math.round(i * phi)) * 360;
        y = (i / points_numb - Math.round(i / points_numb)) * 360;

        m = GeoVdek(1, x, y);

        for (var j = 0; j < dir_list.length; j++ )
        {
            if (angle_between_v(dir_list[j], m) < angle_list[j] * Math.PI / 180)
            {
                print_point = 1;
            }
            else { print_point = 0; break; }
        }

        if (print_point == 1)
        {
            grid_points.push(m);

        }
        print_point = 0;
    }



    //---------------------------------------------------------------------------------------
    // center zone calc
    //---------------------------------------------------------------------------------------

    var center_zone = [0,0,0];

    for (var i = 0; i < grid_points.length; i++)
    {
        center_zone[0] += grid_points[i][0];
        center_zone[1] += grid_points[i][1];
        center_zone[2] += grid_points[i][2];
    }
    center_zone = NormalizeV(center_zone);


    //-----------------------------------------------------------------
    // Interface
    //-----------------------------------------------------------------
//     const my_output = ({ firstName, lastName }: { firstName: string, lastName: string }) => <div>Hey you! {firstName} {lastName}!</div>;
//     const [count, setCount] = useState(0);


      const [count, setCount] = useState(0);

      const handleClick = () => {
        setCount(count + 1);
      };

      return (
        <div>
          <button onClick={handleClick}>Нажми на меня</button>
          <p>Количество нажатий: {count}</p>
        </div>
      );
    };

//     return (
//         <div>
//
//         <h1>`Test jsx ${count}`</h1>
//         <button onClick=setCount(count + 1)>reload</button>
//
//         </div>
//     )
// }


//                     e('h1', {className: 'font-hold', key: 1}, `Test jsx ${count}`),
//
//
//                     e('button', {className: 'btn', key: 4443245, onClick: () => setCount(count + 1), display: "inline-block"}, 'reload'),
//                     e('my_output', {key: 576767777666, firstName: 'ggg', lastname: 'gfdgffg'}, 'enter your data ...'),
//